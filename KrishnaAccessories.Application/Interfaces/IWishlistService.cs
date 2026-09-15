using KrishnaAccessories.Application.DTOs.Wishlist;

namespace KrishnaAccessories.Application.Interfaces;

public interface IWishlistService
{
    Task<WishlistDto> GetWishlistAsync(Guid userId);
    Task<bool> AddToWishlistAsync(Guid userId, Guid productId);
    Task<bool> RemoveFromWishlistAsync(Guid userId, Guid productId);
}
