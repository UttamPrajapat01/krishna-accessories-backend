using KrishnaAccessories.Application.DTOs.Coupons;

namespace KrishnaAccessories.Application.Interfaces;

public interface ICouponService
{
    Task<List<CouponDto>> GetAllCouponsAsync();
    Task<CouponDto> CreateCouponAsync(CreateCouponDto dto);
    Task<CouponDiscountResultDto> ValidateAndApplyCouponAsync(string code, decimal amount);
    Task<bool> DeleteCouponAsync(Guid id);
}
