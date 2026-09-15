using KrishnaAccessories.Application.DTOs.Brands;

namespace KrishnaAccessories.Application.Interfaces;

public interface IBrandService
{
    Task<List<BrandDto>> GetAllBrandsAsync(bool includeInactive = false);
    Task<BrandDto> GetBrandByIdAsync(Guid id);
    Task<BrandDto> CreateBrandAsync(CreateBrandDto dto);
    Task<BrandDto> UpdateBrandAsync(Guid id, UpdateBrandDto dto);
    Task<bool> DeleteBrandAsync(Guid id);
}
