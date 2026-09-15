using KrishnaAccessories.Application.DTOs.Payments;

namespace KrishnaAccessories.Application.Interfaces;

public interface IPaymentService
{
    Task<RazorpayOrderResponseDto> CreateRazorpayOrderAsync(Guid orderId);
    Task<bool> VerifyPaymentAsync(VerifyPaymentDto dto);
    Task<PaymentDto?> GetPaymentByOrderIdAsync(Guid orderId);
    Task<bool> ProcessWebhookAsync(string payload, string signature);
}
