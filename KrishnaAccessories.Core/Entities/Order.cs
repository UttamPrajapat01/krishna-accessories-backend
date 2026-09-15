using KrishnaAccessories.Core.Enums;

namespace KrishnaAccessories.Core.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid? AddressId { get; set; }
    public string ShippingAddressSnapshot { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal ShippingAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = PaymentMethods.Razorpay;
    public string PaymentStatus { get; set; } = Enums.PaymentStatus.Pending.ToString();
    public string OrderStatus { get; set; } = Enums.OrderStatus.Pending.ToString();
    public string? TrackingNumber { get; set; }
    public string? Notes { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public Payment? Payment { get; set; }
}
