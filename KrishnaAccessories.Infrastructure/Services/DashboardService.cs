using KrishnaAccessories.Application.DTOs.Admin;
using KrishnaAccessories.Application.DTOs.Orders;
using KrishnaAccessories.Application.DTOs.Products;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Enums;
using KrishnaAccessories.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace KrishnaAccessories.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;

    public DashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var totalProducts = await _context.Products.CountAsync(p => p.IsActive);
        var totalCustomers = await _context.Users.CountAsync(u => u.Role == UserRoles.Customer);
        var totalOrders = await _context.Orders.CountAsync();
        var pendingOrders = await _context.Orders.CountAsync(o => o.OrderStatus == OrderStatus.Pending.ToString() || o.OrderStatus == OrderStatus.Confirmed.ToString());
        var deliveredOrders = await _context.Orders.CountAsync(o => o.OrderStatus == OrderStatus.Delivered.ToString());

        var totalRevenue = await _context.Orders
            .Where(o => o.PaymentStatus == PaymentStatus.Captured.ToString() || o.OrderStatus == OrderStatus.Delivered.ToString())
            .SumAsync(o => o.TotalAmount);

        var lowStockProducts = await _context.Inventories
            .Include(i => i.Product)
                .ThenInclude(p => p.Images)
            .Include(i => i.Product)
                .ThenInclude(p => p.Category)
            .Include(i => i.Product)
                .ThenInclude(p => p.Brand)
            .Where(i => i.QuantityAvailable <= i.LowStockThreshold)
            .Select(i => new ProductDto
            {
                Id = i.Product.Id,
                Name = i.Product.Name,
                SKU = i.Product.SKU,
                Price = i.Product.Price,
                MRP = i.Product.MRP,
                StockQuantity = i.QuantityAvailable,
                CategoryName = i.Product.Category.Name,
                BrandName = i.Product.Brand.Name,
                MainImageUrl = i.Product.Images.OrderBy(img => img.DisplayOrder).FirstOrDefault() != null ? i.Product.Images.OrderBy(img => img.DisplayOrder).First().ImageUrl : null
            })
            .ToListAsync();

        var recentOrders = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.User.FullName,
                CustomerEmail = o.User.Email,
                TotalAmount = o.TotalAmount,
                OrderStatus = o.OrderStatus,
                PaymentStatus = o.PaymentStatus,
                CreatedAt = o.CreatedAt,
                Items = o.Items.Select(i => new OrderItemDto
                {
                    Id = i.Id,
                    ProductName = i.ProductName,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    TotalPrice = i.TotalPrice
                }).ToList()
            })
            .ToListAsync();

        return new DashboardStatsDto
        {
            TotalProducts = totalProducts,
            TotalCustomers = totalCustomers,
            TotalOrders = totalOrders,
            PendingOrders = pendingOrders,
            DeliveredOrders = deliveredOrders,
            TotalRevenue = totalRevenue,
            LowStockProductsCount = lowStockProducts.Count,
            RecentOrders = recentOrders,
            LowStockProducts = lowStockProducts
        };
    }
}
