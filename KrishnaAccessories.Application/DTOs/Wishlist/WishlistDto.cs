namespace KrishnaAccessories.Application.DTOs.Wishlist;

public class WishlistDto
{
    public Guid Id { get; set; }
    public List<WishlistItemDto> Items { get; set; } = new();
}

public class WishlistItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal MRP { get; set; }
    public decimal Discount { get; set; }
    public string? ImageUrl { get; set; }
    public int StockQuantity { get; set; }
    public bool InStock => StockQuantity > 0;
}
