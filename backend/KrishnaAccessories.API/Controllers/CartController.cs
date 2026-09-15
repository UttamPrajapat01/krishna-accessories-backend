using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Cart;
using KrishnaAccessories.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KrishnaAccessories.API.Controllers;

[Authorize]
public class CartController : BaseApiController
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<CartDto>>> GetCart()
    {
        var result = await _cartService.GetCartAsync(CurrentUserId);
        return Ok(ApiResponse<CartDto>.SuccessResult(result));
    }

    [HttpPost("items")]
    public async Task<ActionResult<ApiResponse<CartDto>>> AddItem([FromBody] AddToCartDto dto)
    {
        var result = await _cartService.AddItemAsync(CurrentUserId, dto);
        return Ok(ApiResponse<CartDto>.SuccessResult(result, "Item added to cart"));
    }

    [HttpPut("items/{id:guid}")]
    public async Task<ActionResult<ApiResponse<CartDto>>> UpdateItem(Guid id, [FromBody] UpdateCartItemDto dto)
    {
        var result = await _cartService.UpdateItemQuantityAsync(CurrentUserId, id, dto.Quantity);
        return Ok(ApiResponse<CartDto>.SuccessResult(result, "Cart item updated"));
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<ActionResult<ApiResponse<CartDto>>> RemoveItem(Guid id)
    {
        var result = await _cartService.RemoveItemAsync(CurrentUserId, id);
        return Ok(ApiResponse<CartDto>.SuccessResult(result, "Item removed from cart"));
    }

    [HttpDelete]
    public async Task<ActionResult<ApiResponse<bool>>> ClearCart()
    {
        var result = await _cartService.ClearCartAsync(CurrentUserId);
        return Ok(ApiResponse<bool>.SuccessResult(result, "Cart cleared successfully"));
    }
}
