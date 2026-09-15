using KrishnaAccessories.Application.DTOs.Categories;
using KrishnaAccessories.Application.Exceptions;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace KrishnaAccessories.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;

    public CategoryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetAllCategoriesAsync(bool includeInactive = false)
    {
        var query = _context.Categories.Include(c => c.Products).AsQueryable();
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }

        return await query
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                IsActive = c.IsActive,
                DisplayOrder = c.DisplayOrder,
                ProductCount = c.Products.Count(p => p.IsActive)
            })
            .ToListAsync();
    }

    public async Task<CategoryDto> GetCategoryByIdAsync(Guid id)
    {
        var c = await _context.Categories.Include(x => x.Products).FirstOrDefaultAsync(x => x.Id == id);
        if (c == null) throw new NotFoundException("Category", id);

        return new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            Description = c.Description,
            ImageUrl = c.ImageUrl,
            IsActive = c.IsActive,
            DisplayOrder = c.DisplayOrder,
            ProductCount = c.Products.Count(p => p.IsActive)
        };
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto)
    {
        var slug = string.IsNullOrWhiteSpace(dto.Slug)
            ? dto.Name.Trim().ToLower().Replace(" ", "-")
            : dto.Slug.Trim().ToLower();

        if (await _context.Categories.AnyAsync(c => c.Slug == slug))
        {
            throw new BadRequestException($"Category slug '{slug}' already exists.");
        }

        var cat = new Category
        {
            Name = dto.Name.Trim(),
            Slug = slug,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            IsActive = dto.IsActive,
            DisplayOrder = dto.DisplayOrder
        };

        _context.Categories.Add(cat);
        await _context.SaveChangesAsync();
        return await GetCategoryByIdAsync(cat.Id);
    }

    public async Task<CategoryDto> UpdateCategoryAsync(Guid id, UpdateCategoryDto dto)
    {
        var cat = await _context.Categories.FindAsync(id);
        if (cat == null) throw new NotFoundException("Category", id);

        var slug = string.IsNullOrWhiteSpace(dto.Slug)
            ? dto.Name.Trim().ToLower().Replace(" ", "-")
            : dto.Slug.Trim().ToLower();

        if (await _context.Categories.AnyAsync(c => c.Slug == slug && c.Id != id))
        {
            throw new BadRequestException($"Category slug '{slug}' already exists.");
        }

        cat.Name = dto.Name.Trim();
        cat.Slug = slug;
        cat.Description = dto.Description;
        cat.ImageUrl = dto.ImageUrl;
        cat.IsActive = dto.IsActive;
        cat.DisplayOrder = dto.DisplayOrder;

        await _context.SaveChangesAsync();
        return await GetCategoryByIdAsync(id);
    }

    public async Task<bool> DeleteCategoryAsync(Guid id)
    {
        var cat = await _context.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id);
        if (cat == null) throw new NotFoundException("Category", id);
        if (cat.Products.Any(p => p.IsActive))
        {
            throw new BadRequestException("Cannot delete category containing active products.");
        }

        _context.Categories.Remove(cat);
        await _context.SaveChangesAsync();
        return true;
    }
}
