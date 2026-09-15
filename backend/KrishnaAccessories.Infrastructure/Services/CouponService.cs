using KrishnaAccessories.Application.DTOs.Coupons;
using KrishnaAccessories.Application.Exceptions;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Core.Enums;
using KrishnaAccessories.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace KrishnaAccessories.Infrastructure.Services;

public class CouponService : ICouponService
{
    private readonly ApplicationDbContext _context;

    public CouponService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CouponDto>> GetAllCouponsAsync()
    {
        return await _context.Coupons
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CouponDto
            {
                Id = c.Id,
                Code = c.Code,
                DiscountType = c.DiscountType,
                DiscountValue = c.DiscountValue,
                MinimumOrderAmount = c.MinimumOrderAmount,
                MaxDiscountAmount = c.MaxDiscountAmount,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                UsageLimit = c.UsageLimit,
                UsageCount = c.UsageCount,
                IsActive = c.IsActive
            })
            .ToListAsync();
    }

    public async Task<CouponDto> CreateCouponAsync(CreateCouponDto dto)
    {
        var code = dto.Code.Trim().ToUpperInvariant();
        if (await _context.Coupons.AnyAsync(c => c.Code == code))
        {
            throw new BadRequestException($"Coupon code '{code}' already exists.");
        }

        var coupon = new Coupon
        {
            Code = code,
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MinimumOrderAmount = dto.MinimumOrderAmount,
            MaxDiscountAmount = dto.MaxDiscountAmount,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            UsageLimit = dto.UsageLimit,
            IsActive = dto.IsActive
        };

        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();

        return new CouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            DiscountType = coupon.DiscountType,
            DiscountValue = coupon.DiscountValue,
            MinimumOrderAmount = coupon.MinimumOrderAmount,
            MaxDiscountAmount = coupon.MaxDiscountAmount,
            StartDate = coupon.StartDate,
            EndDate = coupon.EndDate,
            UsageLimit = coupon.UsageLimit,
            UsageCount = coupon.UsageCount,
            IsActive = coupon.IsActive
        };
    }

    public async Task<CouponDiscountResultDto> ValidateAndApplyCouponAsync(string code, decimal amount)
    {
        var c = await _context.Coupons.FirstOrDefaultAsync(x => x.Code == code.Trim().ToUpperInvariant());
        if (c == null || !c.IsActive)
        {
            return new CouponDiscountResultDto { IsValid = false, Message = "Invalid or inactive promo code." };
        }

        if (c.StartDate.HasValue && DateTime.UtcNow < c.StartDate.Value)
        {
            return new CouponDiscountResultDto { IsValid = false, Message = "Promo code is not yet active." };
        }

        if (c.EndDate.HasValue && DateTime.UtcNow > c.EndDate.Value)
        {
            return new CouponDiscountResultDto { IsValid = false, Message = "Promo code has expired." };
        }

        if (c.UsageLimit.HasValue && c.UsageCount >= c.UsageLimit.Value)
        {
            return new CouponDiscountResultDto { IsValid = false, Message = "Promo code usage limit reached." };
        }

        if (amount < c.MinimumOrderAmount)
        {
            return new CouponDiscountResultDto
            {
                IsValid = false,
                Message = $"Minimum order of ₹{c.MinimumOrderAmount} required for this promo code."
            };
        }

        decimal discount = 0;
        if (c.DiscountType == "Percentage")
        {
            discount = Math.Round((amount * c.DiscountValue) / 100m, 2);
            if (c.MaxDiscountAmount.HasValue && discount > c.MaxDiscountAmount.Value)
            {
                discount = c.MaxDiscountAmount.Value;
            }
        }
        else
        {
            discount = c.DiscountValue;
        }

        if (discount > amount) discount = amount;

        return new CouponDiscountResultDto
        {
            IsValid = true,
            Message = "Coupon applied successfully!",
            DiscountAmount = discount,
            FinalAmount = amount - discount
        };
    }

    public async Task<bool> DeleteCouponAsync(Guid id)
    {
        var c = await _context.Coupons.FindAsync(id);
        if (c == null) throw new NotFoundException("Coupon", id);

        _context.Coupons.Remove(c);
        await _context.SaveChangesAsync();
        return true;
    }
}
