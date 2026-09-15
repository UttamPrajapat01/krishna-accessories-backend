using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Orders;
using KrishnaAccessories.Application.Exceptions;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Core.Enums;
using KrishnaAccessories.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace KrishnaAccessories.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _context;
    private readonly ICouponService _couponService;
    private readonly INotificationService _notificationService;

    public OrderService(ApplicationDbContext context, ICouponService couponService, INotificationService notificationService)
    {
        _context = context;
        _couponService = couponService;
        _notificationService = notificationService;
    }

    public async Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || !cart.Items.Any())
            {
                throw new BadRequestException("Your cart is empty.");
            }

            var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == dto.AddressId && a.UserId == userId);
            if (address == null)
            {
                throw new NotFoundException("Address", dto.AddressId);
            }

            // 1. Validate stock and calculate safe server-side pricing
            decimal subTotal = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in cart.Items)
            {
                var product = await _context.Products.Include(p => p.Inventory).FirstOrDefaultAsync(p => p.Id == item.ProductId);
                if (product == null || !product.IsActive)
                {
                    throw new BadRequestException($"Product '{item.Product.Name}' is no longer available.");
                }

                if (product.StockQuantity < item.Quantity)
                {
                    throw new BadRequestException($"Product '{product.Name}' has only {product.StockQuantity} units in stock.");
                }

                // Deduct stock
                product.StockQuantity -= item.Quantity;
                if (product.Inventory != null)
                {
                    product.Inventory.QuantityAvailable -= item.Quantity;
                    product.Inventory.UpdatedAt = DateTime.UtcNow;
                }

                var itemTotal = product.Price * item.Quantity;
                subTotal += itemTotal;

                var imgUrl = product.Images.OrderBy(img => img.DisplayOrder).FirstOrDefault()?.ImageUrl;
                orderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    ProductSku = product.SKU,
                    ProductImageUrl = imgUrl,
                    UnitPrice = product.Price,
                    Quantity = item.Quantity,
                    TotalPrice = itemTotal
                });
            }

            // 2. Shipping calculation
            decimal shipping = subTotal > 0 && subTotal < 1000 ? 99m : 0m;
            decimal tax = Math.Round(subTotal * 0.18m, 2);

            // 3. Coupon Discount
            decimal discount = 0;
            Coupon? matchedCoupon = null;
            if (!string.IsNullOrWhiteSpace(dto.CouponCode))
            {
                var couponResult = await _couponService.ValidateAndApplyCouponAsync(dto.CouponCode, subTotal);
                if (couponResult.IsValid)
                {
                    discount = couponResult.DiscountAmount;
                    matchedCoupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == dto.CouponCode.Trim().ToUpperInvariant());
                    if (matchedCoupon != null)
                    {
                        matchedCoupon.UsageCount++;
                    }
                }
            }

            decimal totalAmount = Math.Max(0, subTotal + shipping - discount);

            // Generate unique luxury order number: KA-YYYYMMDD-XXXX
            var orderNumber = $"KA-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

            var addressSnapshot = $"{address.FullName}, Phone: {address.Phone}\n{address.AddressLine1}{(string.IsNullOrEmpty(address.AddressLine2) ? "" : ", " + address.AddressLine2)}\n{address.City}, {address.State} - {address.PostalCode}, {address.Country}";

            var order = new Order
            {
                OrderNumber = orderNumber,
                UserId = userId,
                AddressId = address.Id,
                ShippingAddressSnapshot = addressSnapshot,
                SubTotal = subTotal,
                TaxAmount = tax,
                ShippingAmount = shipping,
                DiscountAmount = discount,
                TotalAmount = totalAmount,
                PaymentMethod = dto.PaymentMethod,
                PaymentStatus = dto.PaymentMethod == PaymentMethods.CashOnDelivery ? PaymentStatus.Authorized.ToString() : PaymentStatus.Pending.ToString(),
                OrderStatus = dto.PaymentMethod == PaymentMethods.CashOnDelivery ? OrderStatus.Confirmed.ToString() : OrderStatus.Pending.ToString(),
                Notes = dto.Notes,
                Items = orderItems
            };

            _context.Orders.Add(order);

            // Record Coupon Usage
            if (matchedCoupon != null)
            {
                _context.CouponUsages.Add(new CouponUsage
                {
                    CouponId = matchedCoupon.Id,
                    UserId = userId,
                    Order = order,
                    DiscountApplied = discount
                });
            }

            // Clear user cart
            _context.CartItems.RemoveRange(cart.Items);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Send notification
            await _notificationService.SendNotificationAsync(
                userId,
                "Order Placed Successfully",
                $"Your luxury order #{order.OrderNumber} for ₹{order.TotalAmount:N2} has been placed.",
                "Order",
                order.Id.ToString()
            );

            return await GetOrderByIdAsync(userId, order.Id);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<PagedResult<OrderDto>> GetUserOrdersAsync(Guid userId, int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.User)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync();
        var page = pageNumber < 1 ? 1 : pageNumber;
        var size = pageSize < 1 ? 10 : pageSize;

        var items = await query
            .Skip((page - 1) * size)
            .Take(size)
            .Select(o => MapToDto(o))
            .ToListAsync();

        return new PagedResult<OrderDto>
        {
            Items = items,
            TotalCount = total,
            PageNumber = page,
            PageSize = size
        };
    }

    public async Task<OrderDto> GetOrderByIdAsync(Guid userId, Guid orderId, bool isAdmin = false)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.User)
            .AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(o => o.UserId == userId);
        }

        var order = await query.FirstOrDefaultAsync(o => o.Id == orderId);
        if (order == null) throw new NotFoundException("Order", orderId);

        return MapToDto(order);
    }

    public async Task<bool> CancelOrderAsync(Guid userId, Guid orderId)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

        if (order == null) throw new NotFoundException("Order", orderId);

        if (order.OrderStatus == OrderStatus.Shipped.ToString() ||
            order.OrderStatus == OrderStatus.OutForDelivery.ToString() ||
            order.OrderStatus == OrderStatus.Delivered.ToString())
        {
            throw new BadRequestException("This order cannot be cancelled as it has already shipped or been delivered.");
        }

        order.OrderStatus = OrderStatus.Cancelled.ToString();

        // Restock inventory
        foreach (var item in order.Items)
        {
            var product = await _context.Products.Include(p => p.Inventory).FirstOrDefaultAsync(p => p.Id == item.ProductId);
            if (product != null)
            {
                product.StockQuantity += item.Quantity;
                if (product.Inventory != null)
                {
                    product.Inventory.QuantityAvailable += item.Quantity;
                }
            }
        }

        await _context.SaveChangesAsync();

        await _notificationService.SendNotificationAsync(
            userId,
            "Order Cancelled",
            $"Your order #{order.OrderNumber} has been successfully cancelled.",
            "Order"
        );

        return true;
    }

    public async Task<PagedResult<OrderDto>> GetAllOrdersAdminAsync(int pageNumber = 1, int pageSize = 20, string? status = null)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(o => o.OrderStatus == status);
        }

        var total = await query.CountAsync();
        var page = pageNumber < 1 ? 1 : pageNumber;
        var size = pageSize < 1 ? 20 : pageSize;

        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * size)
            .Take(size)
            .Select(o => MapToDto(o))
            .ToListAsync();

        return new PagedResult<OrderDto>
        {
            Items = items,
            TotalCount = total,
            PageNumber = page,
            PageSize = size
        };
    }

    public async Task<OrderDto> UpdateOrderStatusAdminAsync(Guid orderId, UpdateOrderStatusDto dto)
    {
        var order = await _context.Orders.Include(o => o.Items).Include(o => o.User).FirstOrDefaultAsync(o => o.Id == orderId);
        if (order == null) throw new NotFoundException("Order", orderId);

        order.OrderStatus = dto.OrderStatus;
        if (!string.IsNullOrWhiteSpace(dto.TrackingNumber)) order.TrackingNumber = dto.TrackingNumber;
        if (!string.IsNullOrWhiteSpace(dto.Notes)) order.Notes = dto.Notes;

        await _context.SaveChangesAsync();

        await _notificationService.SendNotificationAsync(
            order.UserId,
            $"Order Update: {order.OrderStatus}",
            $"Your order #{order.OrderNumber} status has been updated to: {order.OrderStatus}." +
            (string.IsNullOrWhiteSpace(order.TrackingNumber) ? "" : $" Tracking: {order.TrackingNumber}"),
            "Order"
        );

        return MapToDto(order);
    }

    private static OrderDto MapToDto(Order o) => new()
    {
        Id = o.Id,
        OrderNumber = o.OrderNumber,
        UserId = o.UserId,
        CustomerName = o.User?.FullName ?? "",
        CustomerEmail = o.User?.Email ?? "",
        ShippingAddressSnapshot = o.ShippingAddressSnapshot,
        SubTotal = o.SubTotal,
        TaxAmount = o.TaxAmount,
        ShippingAmount = o.ShippingAmount,
        DiscountAmount = o.DiscountAmount,
        TotalAmount = o.TotalAmount,
        PaymentMethod = o.PaymentMethod,
        PaymentStatus = o.PaymentStatus,
        OrderStatus = o.OrderStatus,
        TrackingNumber = o.TrackingNumber,
        Notes = o.Notes,
        CreatedAt = o.CreatedAt,
        Items = o.Items.Select(i => new OrderItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            ProductSku = i.ProductSku,
            ProductImageUrl = i.ProductImageUrl,
            UnitPrice = i.UnitPrice,
            Quantity = i.Quantity,
            TotalPrice = i.TotalPrice
        }).ToList()
    };
}
