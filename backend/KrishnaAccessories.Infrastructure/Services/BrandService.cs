using KrishnaAccessories.Application.DTOs.Brands;
using KrishnaAccessories.Application.Exceptions;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace KrishnaAccessories.Infrastructure.Services;

public class BrandService : IBrandService
{
    private readonly ApplicationDbContext _context;

    public BrandService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BrandDto>> GetAllBrandsAsync(bool includeInactive = false)
    {
        var query = _context.Brands.Include(b => b.Products).AsQueryable();
        if (!includeInactive) query = query.Where(b => b.IsActive);

        return await query
            .OrderBy(b => b.Name)
            .Select(b => new BrandDto
            {
                Id = b.Id,
                Name = b.Name,
                Slug = b.Slug,
                LogoUrl = b.LogoUrl,
                Description = b.Description,
                IsActive = b.IsActive,
                ProductCount = b.Products.Count(p => p.IsActive)
            })
            .ToListAsync();
    }

    public async Task<BrandDto> GetBrandByIdAsync(Guid id)
    {
        var b = await _context.Brands.Include(x => x.Products).FirstOrDefaultAsync(x => x.Id == id);
        if (b == null) throw new NotFoundException("Brand", id);

        return new BrandDto
        {
            Id = b.Id,
            Name = b.Name,
            Slug = b.Slug,
            LogoUrl = b.LogoUrl,
            Description = b.Description,
            IsActive = b.IsActive,
            ProductCount = b.Products.Count(p => p.IsActive)
        };
    }

    public async Task<BrandDto> CreateBrandAsync(CreateBrandDto dto)
    {
        var slug = string.IsNullOrWhiteSpace(dto.Slug)
            ? dto.Name.Trim().ToLower().Replace(" ", "-")
            : dto.Slug.Trim().ToLower();

        if (await _context.Brands.AnyAsync(b => b.Slug == slug))
        {
            throw new BadRequestException($"Brand slug '{slug}' already exists.");
        }

        var brand = new Brand
        {
            Name = dto.Name.Trim(),
            Slug = slug,
            LogoUrl = dto.LogoUrl,
            Description = dto.Description,
            IsActive = dto.IsActive
        };

        _context.Brands.Add(brand);
        await _context.SaveChangesAsync();
        return await GetBrandByIdAsync(brand.Id);
    }

    public async Task<BrandDto> UpdateBrandAsync(Guid id, UpdateBrandDto dto)
    {
        var brand = await _context.Brands.FindAsync(id);
        if (brand == null) throw new NotFoundException("Brand", id);

        var slug = string.IsNullOrWhiteSpace(dto.Slug)
            ? dto.Name.Trim().ToLower().Replace(" ", "-")
            : dto.Slug.Trim().ToLower();

        if (await _context.Brands.AnyAsync(b => b.Slug == slug && b.Id != id))
        {
            throw new BadRequestException($"Brand slug '{slug}' already exists.");
        }

        brand.Name = dto.Name.Trim();
        brand.Slug = slug;
        brand.LogoUrl = dto.LogoUrl;
        brand.Description = dto.Description;
        brand.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return await GetBrandByIdAsync(id);
    }

    public async Task<bool> DeleteBrandAsync(Guid id)
    {
        var brand = await _context.Brands.Include(b => b.Products).FirstOrDefaultAsync(b => b.Id == id);
        if (brand == null) throw new NotFoundException("Brand", id);
        if (brand.Products.Any(p => p.IsActive))
        {
            throw new BadRequestException("Cannot delete brand containing active products.");
        }

        _context.Brands.Remove(brand);
        await _context.SaveChangesAsync();
        return true;
    }
}
