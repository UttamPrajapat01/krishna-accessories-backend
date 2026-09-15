using KrishnaAccessories.Application.DTOs.Cart;
using KrishnaAccessories.Application.Exceptions;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace KrishnaAccessories.Infrastructure.Services;

public class CartService : ICartService
{
    private readonly ApplicationDbContext _context;

    public CartService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CartDto> GetCartAsync(Guid userId)
    {
        var cart = await GetOrCreateCartAsync(userId);
        return MapToCartDto(cart);
    }

    public async Task<CartDto> AddItemAsync(Guid userId, AddToCartDto dto)
    {
        if (dto.Quantity <= 0) throw new BadRequestException("Quantity must be at least 1.");

        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null || !product.IsActive)
        {
            throw new NotFoundException("Product", dto.ProductId);
        }

        if (product.StockQuantity < dto.Quantity)
        {
            throw new BadRequestException($"Only {product.StockQuantity} units available in stock.");
        }

        var cart = await GetOrCreateCartAsync(userId);
        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);

        if (existingItem != null)
        {
            var newQty = existingItem.Quantity + dto.Quantity;
            if (product.StockQuantity < newQty)
            {
                throw new BadRequestException($"Cannot add {dto.Quantity} more. Only {product.StockQuantity} units total available.");
            }
            existingItem.Quantity = newQty;
            existingItem.UnitPrice = product.Price; // Sync with real price
        }
        else
        {
            var newItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = product.Id,
                Quantity = dto.Quantity,
                UnitPrice = product.Price
            };
            _context.CartItems.Add(newItem);
        }

        await _context.SaveChangesAsync();
        return MapToCartDto(cart);
    }

    public async Task<CartDto> UpdateItemQuantityAsync(Guid userId, Guid itemId, int quantity)
    {
        var cart = await GetOrCreateCartAsync(userId);
        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null) throw new NotFoundException("Cart item", itemId);

        if (quantity <= 0)
        {
            cart.Items.Remove(item);
        }
        else
        {
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product != null && product.StockQuantity < quantity)
            {
                throw new BadRequestException($"Only {product.StockQuantity} units available.");
            }
            item.Quantity = quantity;
            if (product != null) item.UnitPrice = product.Price;
        }

        await _context.SaveChangesAsync();
        return MapToCartDto(cart);
    }

    public async Task<CartDto> RemoveItemAsync(Guid userId, Guid itemId)
    {
        var cart = await GetOrCreateCartAsync(userId);
        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            cart.Items.Remove(item);
            await _context.SaveChangesAsync();
        }

        return MapToCartDto(cart);
    }

    public async Task<bool> ClearCartAsync(Guid userId)
    {
        var cart = await GetOrCreateCartAsync(userId);
        cart.Items.Clear();
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<Cart> GetOrCreateCartAsync(Guid userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }

    private static CartDto MapToCartDto(Cart cart)
    {
        var items = cart.Items.Select(i =>
        {
            var p = i.Product;
            var img = p.Images.OrderBy(img => img.DisplayOrder).FirstOrDefault()?.ImageUrl;
            return new CartItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = p.Name,
                ProductSku = p.SKU,
                ProductImageUrl = img,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                TotalPrice = i.UnitPrice * i.Quantity,
                AvailableStock = p.StockQuantity
            };
        }).ToList();

        var subTotal = items.Sum(i => i.TotalPrice);
        // Free shipping if subtotal >= 1000, else 99
        var shipping = subTotal > 0 && subTotal < 1000 ? 99m : 0m;
        // 18% GST included or calculated
        var tax = Math.Round(subTotal * 0.18m, 2);
        var total = subTotal + shipping;

        return new CartDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            Items = items,
            SubTotal = subTotal,
            EstimatedTax = tax,
            EstimatedShipping = shipping,
            TotalAmount = total,
            ItemCount = items.Sum(i => i.Quantity)
        };
    }
}
