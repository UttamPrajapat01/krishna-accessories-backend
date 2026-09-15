namespace KrishnaAccessories.Core.Entities;

public class Inventory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int QuantityAvailable { get; set; }
    public int QuantityReserved { get; set; }
    public int LowStockThreshold { get; set; } = 5;
    public DateTime? LastRestockedAt { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
