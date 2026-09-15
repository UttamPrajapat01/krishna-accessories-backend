using KrishnaAccessories.Application.DTOs.Reviews;

namespace KrishnaAccessories.Application.Interfaces;

public interface IReviewService
{
    Task<List<ReviewDto>> GetProductReviewsAsync(Guid productId);
    Task<ReviewDto> AddReviewAsync(Guid userId, CreateReviewDto dto);
    Task<List<ReviewDto>> GetAllReviewsAdminAsync();
    Task<bool> ApproveReviewAdminAsync(Guid reviewId, bool isApproved);
}
