using KrishnaAccessories.Application.DTOs.Reviews;
using KrishnaAccessories.Application.Exceptions;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace KrishnaAccessories.Infrastructure.Services;

public class ReviewService : IReviewService
{
    private readonly ApplicationDbContext _context;

    public ReviewService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ReviewDto>> GetProductReviewsAsync(Guid productId)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == productId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                UserId = r.UserId,
                UserName = r.User.FullName,
                Rating = r.Rating,
                Comment = r.Comment,
                IsApproved = r.IsApproved,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<ReviewDto> AddReviewAsync(Guid userId, CreateReviewDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new NotFoundException("User", userId);

        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null) throw new NotFoundException("Product", dto.ProductId);

        var review = new Review
        {
            ProductId = dto.ProductId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment?.Trim(),
            IsApproved = true // Auto-approved for customer convenience
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return new ReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            UserId = review.UserId,
            UserName = user.FullName,
            Rating = review.Rating,
            Comment = review.Comment,
            IsApproved = review.IsApproved,
            CreatedAt = review.CreatedAt
        };
    }

    public async Task<List<ReviewDto>> GetAllReviewsAdminAsync()
    {
        return await _context.Reviews
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                UserId = r.UserId,
                UserName = r.User.FullName,
                Rating = r.Rating,
                Comment = r.Comment,
                IsApproved = r.IsApproved,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<bool> ApproveReviewAdminAsync(Guid reviewId, bool isApproved)
    {
        var r = await _context.Reviews.FindAsync(reviewId);
        if (r == null) throw new NotFoundException("Review", reviewId);

        r.IsApproved = isApproved;
        await _context.SaveChangesAsync();
        return true;
    }
}
