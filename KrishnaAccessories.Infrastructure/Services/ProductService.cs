using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Products;
using KrishnaAccessories.Application.Exceptions;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace KrishnaAccessories.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _context;

    public ProductService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ProductDto>> GetProductsAsync(ProductFilterDto filter)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(s) ||
                                     p.Description.ToLower().Contains(s) ||
                                     p.SKU.ToLower().Contains(s) ||
                                     p.Brand.Name.ToLower().Contains(s) ||
                                     p.Category.Name.ToLower().Contains(s));
        }

        if (filter.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == filter.CategoryId.Value);
        }

        if (filter.BrandId.HasValue)
        {
            query = query.Where(p => p.BrandId == filter.BrandId.Value);
        }

        if (filter.MinPrice.HasValue)
        {
            query = query.Where(p => p.Price >= filter.MinPrice.Value);
        }

        if (filter.MaxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= filter.MaxPrice.Value);
        }

        if (filter.InStockOnly == true)
        {
            query = query.Where(p => p.StockQuantity > 0);
        }

        if (filter.IsFeatured == true)
        {
            query = query.Where(p => p.IsFeatured);
        }

        if (filter.IsBestSeller == true)
        {
            query = query.Where(p => p.IsBestSeller);
        }

        query = filter.SortBy?.ToLower() switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            "popular" => query.OrderByDescending(p => p.IsBestSeller).ThenByDescending(p => p.CreatedAt),
            "rating" => query.OrderByDescending(p => p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var page = filter.PageNumber < 1 ? 1 : filter.PageNumber;
        var size = filter.PageSize < 1 ? 12 : filter.PageSize;

        var items = await query
            .Skip((page - 1) * size)
            .Take(size)
            .Select(p => MapToDto(p))
            .ToListAsync();

        return new PagedResult<ProductDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = page,
            PageSize = size
        };
    }

    public async Task<ProductDto> GetProductByIdAsync(Guid id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            throw new NotFoundException("Product", id);
        }

        return MapToDto(product);
    }

    public async Task<List<ProductDto>> GetFeaturedProductsAsync(int count = 8)
    {
        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .Where(p => p.IsActive && p.IsFeatured)
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .Select(p => MapToDto(p))
            .ToListAsync();
    }

    public async Task<List<ProductDto>> GetBestSellersAsync(int count = 8)
    {
        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .Where(p => p.IsActive && p.IsBestSeller)
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .Select(p => MapToDto(p))
            .ToListAsync();
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        if (await _context.Products.AnyAsync(p => p.SKU == dto.SKU.Trim()))
        {
            throw new BadRequestException($"Product SKU '{dto.SKU}' is already in use.");
        }

        var product = new Product
        {
            Name = dto.Name.Trim(),
            SKU = dto.SKU.Trim().ToUpperInvariant(),
            Description = dto.Description,
            ShortDescription = dto.ShortDescription,
            CategoryId = dto.CategoryId,
            BrandId = dto.BrandId,
            Price = dto.Price,
            MRP = dto.MRP,
            Discount = dto.Discount,
            StockQuantity = dto.StockQuantity,
            IsActive = dto.IsActive,
            IsFeatured = dto.IsFeatured,
            IsBestSeller = dto.IsBestSeller
        };

        int order = 0;
        foreach (var url in dto.ImageUrls)
        {
            product.Images.Add(new ProductImage
            {
                ImageUrl = url,
                IsMain = order == 0,
                DisplayOrder = order++
            });
        }

        product.Inventory = new Inventory
        {
            QuantityAvailable = dto.StockQuantity,
            QuantityReserved = 0,
            LowStockThreshold = 5,
            LastRestockedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return await GetProductByIdAsync(product.Id);
    }

    public async Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductDto dto)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Inventory)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            throw new NotFoundException("Product", id);
        }

        if (await _context.Products.AnyAsync(p => p.SKU == dto.SKU.Trim() && p.Id != id))
        {
            throw new BadRequestException($"SKU '{dto.SKU}' is already used by another product.");
        }

        product.Name = dto.Name.Trim();
        product.SKU = dto.SKU.Trim().ToUpperInvariant();
        product.Description = dto.Description;
        product.ShortDescription = dto.ShortDescription;
        product.CategoryId = dto.CategoryId;
        product.BrandId = dto.BrandId;
        product.Price = dto.Price;
        product.MRP = dto.MRP;
        product.Discount = dto.Discount;
        product.StockQuantity = dto.StockQuantity;
        product.IsActive = dto.IsActive;
        product.IsFeatured = dto.IsFeatured;
        product.IsBestSeller = dto.IsBestSeller;

        if (product.Inventory != null)
        {
            product.Inventory.QuantityAvailable = dto.StockQuantity;
            product.Inventory.UpdatedAt = DateTime.UtcNow;
        }

        if (dto.ImageUrls.Any())
        {
            _context.ProductImages.RemoveRange(product.Images);
            int order = 0;
            foreach (var url in dto.ImageUrls)
            {
                product.Images.Add(new ProductImage
                {
                    ImageUrl = url,
                    IsMain = order == 0,
                    DisplayOrder = order++
                });
            }
        }

        await _context.SaveChangesAsync();
        return await GetProductByIdAsync(id);
    }

    public async Task<bool> DeleteProductAsync(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            throw new NotFoundException("Product", id);
        }

        product.IsActive = false; // Soft delete
        await _context.SaveChangesAsync();
        return true;
    }

    private static ProductDto MapToDto(Product p)
    {
        var mainImg = p.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault(i => i.IsMain)?.ImageUrl
                      ?? p.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault()?.ImageUrl;

        var allImgs = p.Images.OrderBy(i => i.DisplayOrder).Select(i => i.ImageUrl).ToList();

        var approvedReviews = p.Reviews.Where(r => r.IsApproved).ToList();
        var avgRating = approvedReviews.Any() ? Math.Round(approvedReviews.Average(r => r.Rating), 1) : 0;

        return new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            SKU = p.SKU,
            Description = p.Description,
            ShortDescription = p.ShortDescription,
            CategoryId = p.CategoryId,
            CategoryName = p.Category != null ? p.Category.Name : string.Empty,
            BrandId = p.BrandId,
            BrandName = p.Brand != null ? p.Brand.Name : string.Empty,
            Price = p.Price,
            MRP = p.MRP,
            Discount = p.Discount,
            StockQuantity = p.StockQuantity,
            IsActive = p.IsActive,
            IsFeatured = p.IsFeatured,
            IsBestSeller = p.IsBestSeller,
            MainImageUrl = mainImg,
            ImageUrls = allImgs,
            AverageRating = avgRating,
            ReviewCount = approvedReviews.Count,
            CreatedAt = p.CreatedAt
        };
    }
}
