using KrishnaAccessories.Core.Enums;

namespace KrishnaAccessories.Core.Entities;

public class Payment : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public string? RazorpayOrderId { get; set; }
    public string? RazorpayPaymentId { get; set; }
    public string? RazorpaySignature { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public string Status { get; set; } = Enums.PaymentStatus.Pending.ToString();
    public string PaymentMethod { get; set; } = PaymentMethods.Razorpay;
    public string? FailureReason { get; set; }
}
