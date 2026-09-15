using KrishnaAccessories.Application.DTOs.Inventory;

namespace KrishnaAccessories.Application.Interfaces;

public interface IInventoryService
{
    Task<List<InventoryDto>> GetInventoryListAsync();
    Task<InventoryDto> UpdateStockAsync(Guid productId, UpdateInventoryDto dto);
    Task<List<InventoryDto>> GetLowStockAlertsAsync();
}
