namespace KrishnaAccessories.Application.DTOs.Orders;

public class UpdateOrderStatusDto
{
    public string OrderStatus { get; set; } = string.Empty;
    public string? TrackingNumber { get; set; }
    public string? Notes { get; set; }
}
