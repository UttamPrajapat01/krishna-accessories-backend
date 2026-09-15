namespace KrishnaAccessories.Application.DTOs.Inventory;

public class InventoryDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSku { get; set; } = string.Empty;
    public int QuantityAvailable { get; set; }
    public int QuantityReserved { get; set; }
    public int LowStockThreshold { get; set; }
    public bool IsLowStock => QuantityAvailable <= LowStockThreshold;
    public DateTime? LastRestockedAt { get; set; }
}

public class UpdateInventoryDto
{
    public int QuantityAvailable { get; set; }
    public int? LowStockThreshold { get; set; }
}
