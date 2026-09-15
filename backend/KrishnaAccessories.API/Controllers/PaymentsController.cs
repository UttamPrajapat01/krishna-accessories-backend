using System.Text;
using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Payments;
using KrishnaAccessories.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KrishnaAccessories.API.Controllers;

[Authorize]
public class PaymentsController : BaseApiController
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IPaymentService paymentService, ILogger<PaymentsController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    [HttpPost("create-razorpay-order/{orderId:guid}")]
    public async Task<ActionResult<ApiResponse<RazorpayOrderResponseDto>>> CreateRazorpayOrder(Guid orderId)
    {
        var result = await _paymentService.CreateRazorpayOrderAsync(orderId);
        return Ok(ApiResponse<RazorpayOrderResponseDto>.SuccessResult(result));
    }

    [HttpPost("verify")]
    public async Task<ActionResult<ApiResponse<bool>>> VerifyPayment([FromBody] VerifyPaymentDto dto)
    {
        var result = await _paymentService.VerifyPaymentAsync(dto);
        return Ok(ApiResponse<bool>.SuccessResult(result, "Payment verified successfully"));
    }

    [HttpGet("order/{orderId:guid}")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> GetPaymentByOrderId(Guid orderId)
    {
        var result = await _paymentService.GetPaymentByOrderIdAsync(orderId);
        if (result == null)
        {
            return NotFound(ApiResponse<PaymentDto>.ErrorResult("Payment record not found."));
        }
        return Ok(ApiResponse<PaymentDto>.SuccessResult(result));
    }

    /// <summary>
    /// Razorpay server-to-server webhook. Must be AllowAnonymous (no JWT).
    /// Razorpay sends X-Razorpay-Signature header with HMAC-SHA256 of the raw payload.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<IActionResult> RazorpayWebhook()
    {
        // Read raw request body for signature verification
        string payload;
        using (var reader = new StreamReader(Request.Body, Encoding.UTF8, leaveOpen: true))
        {
            payload = await reader.ReadToEndAsync();
        }

        if (string.IsNullOrEmpty(payload))
        {
            _logger.LogWarning("Razorpay webhook received empty payload.");
            return BadRequest("Empty payload.");
        }

        var signature = Request.Headers["X-Razorpay-Signature"].FirstOrDefault() ?? string.Empty;
        if (string.IsNullOrEmpty(signature))
        {
            _logger.LogWarning("Razorpay webhook missing X-Razorpay-Signature header.");
            return BadRequest("Missing signature.");
        }

        var processed = await _paymentService.ProcessWebhookAsync(payload, signature);

        if (!processed)
        {
            // Return 400 to tell Razorpay to retry (invalid signature case)
            return BadRequest("Webhook verification failed.");
        }

        // Always return 200 to acknowledge receipt
        return Ok(new { status = "ok" });
    }
}
