using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Products;

namespace KrishnaAccessories.Application.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetProductsAsync(ProductFilterDto filter);
    Task<ProductDto> GetProductByIdAsync(Guid id);
    Task<List<ProductDto>> GetFeaturedProductsAsync(int count = 8);
    Task<List<ProductDto>> GetBestSellersAsync(int count = 8);
    Task<ProductDto> CreateProductAsync(CreateProductDto dto);
    Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductDto dto);
    Task<bool> DeleteProductAsync(Guid id);
}
