using KrishnaAccessories.Application.DTOs.Wishlist;
using KrishnaAccessories.Application.Exceptions;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace KrishnaAccessories.Infrastructure.Services;

public class WishlistService : IWishlistService
{
    private readonly ApplicationDbContext _context;

    public WishlistService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WishlistDto> GetWishlistAsync(Guid userId)
    {
        var wishlist = await GetOrCreateWishlistAsync(userId);
        return new WishlistDto
        {
            Id = wishlist.Id,
            Items = wishlist.Items.Select(i => new WishlistItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                Price = i.Product.Price,
                MRP = i.Product.MRP,
                Discount = i.Product.Discount,
                ImageUrl = i.Product.Images.OrderBy(img => img.DisplayOrder).FirstOrDefault()?.ImageUrl,
                StockQuantity = i.Product.StockQuantity
            }).ToList()
        };
    }

    public async Task<bool> AddToWishlistAsync(Guid userId, Guid productId)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null) throw new NotFoundException("Product", productId);

        var wishlist = await GetOrCreateWishlistAsync(userId);
        if (!wishlist.Items.Any(i => i.ProductId == productId))
        {
            var item = new WishlistItem { WishlistId = wishlist.Id, ProductId = productId };
            _context.WishlistItems.Add(item);
            await _context.SaveChangesAsync();
        }

        return true;
    }

    public async Task<bool> RemoveFromWishlistAsync(Guid userId, Guid productId)
    {
        var wishlist = await GetOrCreateWishlistAsync(userId);
        var item = wishlist.Items.FirstOrDefault(i => i.ProductId == productId);
        if (item != null)
        {
            wishlist.Items.Remove(item);
            await _context.SaveChangesAsync();
        }

        return true;
    }

    private async Task<Wishlist> GetOrCreateWishlistAsync(Guid userId)
    {
        var wishlist = await _context.Wishlists
            .Include(w => w.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wishlist == null)
        {
            wishlist = new Wishlist { UserId = userId };
            _context.Wishlists.Add(wishlist);
            await _context.SaveChangesAsync();
        }

        return wishlist;
    }
}
