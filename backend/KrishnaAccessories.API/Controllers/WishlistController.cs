using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Wishlist;
using KrishnaAccessories.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KrishnaAccessories.API.Controllers;

[Authorize]
public class WishlistController : BaseApiController
{
    private readonly IWishlistService _wishlistService;

    public WishlistController(IWishlistService wishlistService)
    {
        _wishlistService = wishlistService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<WishlistDto>>> GetWishlist()
    {
        var result = await _wishlistService.GetWishlistAsync(CurrentUserId);
        return Ok(ApiResponse<WishlistDto>.SuccessResult(result));
    }

    [HttpPost("{productId:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> AddToWishlist(Guid productId)
    {
        var result = await _wishlistService.AddToWishlistAsync(CurrentUserId, productId);
        return Ok(ApiResponse<bool>.SuccessResult(result, "Added to wishlist"));
    }

    [HttpDelete("{productId:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveFromWishlist(Guid productId)
    {
        var result = await _wishlistService.RemoveFromWishlistAsync(CurrentUserId, productId);
        return Ok(ApiResponse<bool>.SuccessResult(result, "Removed from wishlist"));
    }
}
