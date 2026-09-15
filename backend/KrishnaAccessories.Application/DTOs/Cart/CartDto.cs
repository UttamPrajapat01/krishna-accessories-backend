namespace KrishnaAccessories.Application.DTOs.Cart;

public class CartDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public decimal SubTotal { get; set; }
    public decimal EstimatedTax { get; set; }
    public decimal EstimatedShipping { get; set; }
    public decimal TotalAmount { get; set; }
    public int ItemCount { get; set; }
}
