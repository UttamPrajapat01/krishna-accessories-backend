using KrishnaAccessories.Application.DTOs.Cart;

namespace KrishnaAccessories.Application.Interfaces;

public interface ICartService
{
    Task<CartDto> GetCartAsync(Guid userId);
    Task<CartDto> AddItemAsync(Guid userId, AddToCartDto dto);
    Task<CartDto> UpdateItemQuantityAsync(Guid userId, Guid itemId, int quantity);
    Task<CartDto> RemoveItemAsync(Guid userId, Guid itemId);
    Task<bool> ClearCartAsync(Guid userId);
}
