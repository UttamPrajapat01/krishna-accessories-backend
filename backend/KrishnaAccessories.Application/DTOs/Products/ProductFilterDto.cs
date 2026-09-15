namespace KrishnaAccessories.Application.DTOs.Products;

public class ProductFilterDto
{
    public string? Search { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? BrandId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? InStockOnly { get; set; }
    public bool? IsFeatured { get; set; }
    public bool? IsBestSeller { get; set; }
    public string? SortBy { get; set; } // price_asc, price_desc, newest, popular, rating
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}
