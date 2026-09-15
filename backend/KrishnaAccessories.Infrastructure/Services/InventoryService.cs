using KrishnaAccessories.Application.DTOs.Inventory;
using KrishnaAccessories.Application.Exceptions;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace KrishnaAccessories.Infrastructure.Services;

public class InventoryService : IInventoryService
{
    private readonly ApplicationDbContext _context;

    public InventoryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<InventoryDto>> GetInventoryListAsync()
    {
        return await _context.Inventories
            .Include(i => i.Product)
            .OrderBy(i => i.QuantityAvailable)
            .Select(i => new InventoryDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                ProductSku = i.Product.SKU,
                QuantityAvailable = i.QuantityAvailable,
                QuantityReserved = i.QuantityReserved,
                LowStockThreshold = i.LowStockThreshold,
                LastRestockedAt = i.LastRestockedAt
            })
            .ToListAsync();
    }

    public async Task<InventoryDto> UpdateStockAsync(Guid productId, UpdateInventoryDto dto)
    {
        var product = await _context.Products.Include(p => p.Inventory).FirstOrDefaultAsync(p => p.Id == productId);
        if (product == null) throw new NotFoundException("Product", productId);

        product.StockQuantity = dto.QuantityAvailable;

        if (product.Inventory == null)
        {
            product.Inventory = new Inventory
            {
                ProductId = productId,
                QuantityAvailable = dto.QuantityAvailable,
                QuantityReserved = 0,
                LowStockThreshold = dto.LowStockThreshold ?? 5,
                LastRestockedAt = DateTime.UtcNow
            };
        }
        else
        {
            product.Inventory.QuantityAvailable = dto.QuantityAvailable;
            if (dto.LowStockThreshold.HasValue) product.Inventory.LowStockThreshold = dto.LowStockThreshold.Value;
            product.Inventory.LastRestockedAt = DateTime.UtcNow;
            product.Inventory.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return new InventoryDto
        {
            Id = product.Inventory.Id,
            ProductId = product.Id,
            ProductName = product.Name,
            ProductSku = product.SKU,
            QuantityAvailable = product.Inventory.QuantityAvailable,
            QuantityReserved = product.Inventory.QuantityReserved,
            LowStockThreshold = product.Inventory.LowStockThreshold,
            LastRestockedAt = product.Inventory.LastRestockedAt
        };
    }

    public async Task<List<InventoryDto>> GetLowStockAlertsAsync()
    {
        return await _context.Inventories
            .Include(i => i.Product)
            .Where(i => i.QuantityAvailable <= i.LowStockThreshold)
            .Select(i => new InventoryDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                ProductSku = i.Product.SKU,
                QuantityAvailable = i.QuantityAvailable,
                QuantityReserved = i.QuantityReserved,
                LowStockThreshold = i.LowStockThreshold,
                LastRestockedAt = i.LastRestockedAt
            })
            .ToListAsync();
    }
}
