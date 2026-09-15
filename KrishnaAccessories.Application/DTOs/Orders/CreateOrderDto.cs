namespace KrishnaAccessories.Application.DTOs.Orders;

public class CreateOrderDto
{
    public Guid AddressId { get; set; }
    public string PaymentMethod { get; set; } = "Razorpay"; // Razorpay or CashOnDelivery
    public string? CouponCode { get; set; }
    public string? Notes { get; set; }
}
