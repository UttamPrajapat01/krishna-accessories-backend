namespace KrishnaAccessories.Core.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public Guid BrandId { get; set; }
    public Brand Brand { get; set; } = null!;
    public decimal Price { get; set; }
    public decimal MRP { get; set; }
    public decimal Discount { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public bool IsBestSeller { get; set; } = false;

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public Inventory? Inventory { get; set; }
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
