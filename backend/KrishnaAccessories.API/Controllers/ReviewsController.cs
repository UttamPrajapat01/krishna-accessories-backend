using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Reviews;
using KrishnaAccessories.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KrishnaAccessories.API.Controllers;

public class ReviewsController : BaseApiController
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet("product/{productId:guid}")]
    public async Task<ActionResult<ApiResponse<List<ReviewDto>>>> GetProductReviews(Guid productId)
    {
        var result = await _reviewService.GetProductReviewsAsync(productId);
        return Ok(ApiResponse<List<ReviewDto>>.SuccessResult(result));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ReviewDto>>> AddReview([FromBody] CreateReviewDto dto)
    {
        var result = await _reviewService.AddReviewAsync(CurrentUserId, dto);
        return Ok(ApiResponse<ReviewDto>.SuccessResult(result, "Review submitted successfully"));
    }
}
