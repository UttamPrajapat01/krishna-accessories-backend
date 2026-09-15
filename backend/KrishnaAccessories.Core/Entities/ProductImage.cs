namespace KrishnaAccessories.Core.Entities;

public class ProductImage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsMain { get; set; }
    public int DisplayOrder { get; set; }
    public string? AltText { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
