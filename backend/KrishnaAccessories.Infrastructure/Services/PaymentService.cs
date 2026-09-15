using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using KrishnaAccessories.Application.DTOs.Payments;
using KrishnaAccessories.Application.Exceptions;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Core.Enums;
using KrishnaAccessories.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace KrishnaAccessories.Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly INotificationService _notificationService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<PaymentService> _logger;

    private const string RazorpayBaseUrl = "https://api.razorpay.com/v1";

    public PaymentService(
        ApplicationDbContext context,
        IConfiguration configuration,
        INotificationService notificationService,
        IHttpClientFactory httpClientFactory,
        ILogger<PaymentService> logger)
    {
        _context = context;
        _configuration = configuration;
        _notificationService = notificationService;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<RazorpayOrderResponseDto> CreateRazorpayOrderAsync(Guid orderId)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null) throw new NotFoundException("Order", orderId);

        var (keyId, keySecret) = GetRazorpayCredentials();

        // Check for idempotency: if we already have a pending Razorpay order, reuse it
        var existingPayment = await _context.Payments
            .FirstOrDefaultAsync(p => p.OrderId == orderId
                                      && p.Status == PaymentStatus.Pending.ToString()
                                      && p.RazorpayOrderId != null);
        if (existingPayment != null)
        {
            _logger.LogInformation("Reusing existing Razorpay order {RzpOrderId} for order {OrderId}",
                existingPayment.RazorpayOrderId, orderId);
            return new RazorpayOrderResponseDto
            {
                OrderId = order.Id,
                OrderNumber = order.OrderNumber,
                RazorpayOrderId = existingPayment.RazorpayOrderId!,
                Amount = order.TotalAmount,
                Currency = "INR",
                KeyId = keyId
            };
        }

        // Call real Razorpay API to create an order
        var razorpayOrderId = await CallRazorpayCreateOrderAsync(order, keyId, keySecret);

        // Save or update Payment record in DB
        var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == orderId);
        if (payment == null)
        {
            payment = new Payment
            {
                OrderId = orderId,
                RazorpayOrderId = razorpayOrderId,
                Amount = order.TotalAmount,
                Currency = "INR",
                Status = PaymentStatus.Pending.ToString(),
                PaymentMethod = PaymentMethods.Razorpay
            };
            _context.Payments.Add(payment);
        }
        else
        {
            payment.RazorpayOrderId = razorpayOrderId;
            payment.Status = PaymentStatus.Pending.ToString();
        }

        await _context.SaveChangesAsync();

        return new RazorpayOrderResponseDto
        {
            OrderId = order.Id,
            OrderNumber = order.OrderNumber,
            RazorpayOrderId = razorpayOrderId,
            Amount = order.TotalAmount,
            Currency = "INR",
            KeyId = keyId
        };
    }

    private async Task<string> CallRazorpayCreateOrderAsync(Order order, string keyId, string keySecret)
    {
        var client = _httpClientFactory.CreateClient();

        // Basic Auth: base64(keyId:keySecret)
        var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{keyId}:{keySecret}"));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);

        // Razorpay expects amount in the smallest currency unit (paise for INR)
        var amountInPaise = (long)(order.TotalAmount * 100);

        var body = new
        {
            amount = amountInPaise,
            currency = "INR",
            receipt = order.OrderNumber,
            notes = new { order_id = order.Id.ToString(), source = "KrishnaAccessoriesApp" }
        };

        var json = JsonSerializer.Serialize(body);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _logger.LogInformation("Creating Razorpay order for OrderId={OrderId}, Amount={Amount} paise",
            order.Id, amountInPaise);

        var response = await client.PostAsync($"{RazorpayBaseUrl}/orders", content);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Razorpay API error. Status={Status}, Body={Body}",
                response.StatusCode, responseBody);
            throw new BadRequestException(
                $"Razorpay order creation failed ({(int)response.StatusCode}). Please try again.");
        }

        using var doc = JsonDocument.Parse(responseBody);
        if (!doc.RootElement.TryGetProperty("id", out var idProp))
            throw new BadRequestException("Razorpay returned an unexpected response. Please try again.");

        var razorpayOrderId = idProp.GetString()
                              ?? throw new BadRequestException("Razorpay order ID is empty.");

        _logger.LogInformation("Razorpay order created: {RzpOrderId}", razorpayOrderId);
        return razorpayOrderId;
    }

    public async Task<bool> VerifyPaymentAsync(VerifyPaymentDto dto)
    {
        var order = await _context.Orders.FindAsync(dto.OrderId);
        if (order == null) throw new NotFoundException("Order", dto.OrderId);

        var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == dto.OrderId);

        // Idempotency: if already captured, return success without re-processing
        if (payment != null && payment.Status == PaymentStatus.Captured.ToString())
        {
            _logger.LogInformation("Payment for OrderId={OrderId} already captured — idempotent return.", dto.OrderId);
            return true;
        }

        var (_, keySecret) = GetRazorpayCredentials();

        // Razorpay signature payload: razorpay_order_id + "|" + razorpay_payment_id
        var payload = $"{dto.RazorpayOrderId}|{dto.RazorpayPaymentId}";
        var computedSignatureBytes = ComputeHmacSha256Bytes(payload, keySecret);

        bool isValid;
        try
        {
            var incomingBytes = HexToBytes(dto.RazorpaySignature);
            isValid = CryptographicOperations.FixedTimeEquals(computedSignatureBytes, incomingBytes);
        }
        catch
        {
            isValid = false;
        }

        if (payment == null)
        {
            payment = new Payment
            {
                OrderId = order.Id,
                RazorpayOrderId = dto.RazorpayOrderId,
                Amount = order.TotalAmount,
                Currency = "INR",
                PaymentMethod = PaymentMethods.Razorpay
            };
            _context.Payments.Add(payment);
        }

        payment.RazorpayPaymentId = dto.RazorpayPaymentId;
        payment.RazorpaySignature = dto.RazorpaySignature;

        if (isValid)
        {
            payment.Status = PaymentStatus.Captured.ToString();
            order.PaymentStatus = PaymentStatus.Captured.ToString();
            order.OrderStatus = OrderStatus.Confirmed.ToString();

            await _context.SaveChangesAsync();

            _logger.LogInformation("Payment captured for OrderId={OrderId}, PaymentId={PaymentId}",
                dto.OrderId, dto.RazorpayPaymentId);

            await _notificationService.SendNotificationAsync(
                order.UserId,
                "Payment Confirmed",
                $"Payment of ₹{order.TotalAmount:N2} for order #{order.OrderNumber} was successful.",
                "Payment"
            );
            return true;
        }
        else
        {
            payment.Status = PaymentStatus.Failed.ToString();
            payment.FailureReason = "Signature mismatch";
            await _context.SaveChangesAsync();

            _logger.LogWarning("Payment signature mismatch for OrderId={OrderId}", dto.OrderId);
            throw new BadRequestException("Payment signature verification failed. Please contact support if you were charged.");
        }
    }

    public async Task<bool> ProcessWebhookAsync(string payload, string signature)
    {
        var webhookSecret = GetWebhookSecret();

        // Verify webhook signature: HMAC-SHA256 of raw payload using webhook secret
        var computedBytes = ComputeHmacSha256Bytes(payload, webhookSecret);
        bool isValid;
        try
        {
            var incomingBytes = HexToBytes(signature);
            isValid = CryptographicOperations.FixedTimeEquals(computedBytes, incomingBytes);
        }
        catch
        {
            isValid = false;
        }

        if (!isValid)
        {
            _logger.LogWarning("Razorpay webhook signature mismatch.");
            return false;
        }

        using var doc = JsonDocument.Parse(payload);
        if (!doc.RootElement.TryGetProperty("event", out var eventProp)) return false;
        var eventName = eventProp.GetString();

        _logger.LogInformation("Received Razorpay webhook event: {Event}", eventName);

        if (eventName is "payment.captured" or "order.paid")
        {
            // Extract payment entity
            if (!doc.RootElement.TryGetProperty("payload", out var webhookPayload)) return false;
            if (!webhookPayload.TryGetProperty("payment", out var paymentEntity)) return false;
            if (!paymentEntity.TryGetProperty("entity", out var entity)) return false;

            var razorpayPaymentId = entity.TryGetProperty("id", out var pid) ? pid.GetString() : null;
            var razorpayOrderId = entity.TryGetProperty("order_id", out var oid) ? oid.GetString() : null;

            if (razorpayPaymentId == null || razorpayOrderId == null) return false;

            var payment = await _context.Payments
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.RazorpayOrderId == razorpayOrderId);

            if (payment == null)
            {
                _logger.LogWarning("Webhook: No payment found for RazorpayOrderId={RzpOrderId}", razorpayOrderId);
                return false;
            }

            // Idempotency: skip if already captured
            if (payment.Status == PaymentStatus.Captured.ToString())
            {
                _logger.LogInformation("Webhook: Payment already captured. Idempotent skip.");
                return true;
            }

            payment.RazorpayPaymentId = razorpayPaymentId;
            payment.Status = PaymentStatus.Captured.ToString();
            payment.Order.PaymentStatus = PaymentStatus.Captured.ToString();
            payment.Order.OrderStatus = OrderStatus.Confirmed.ToString();

            await _context.SaveChangesAsync();

            await _notificationService.SendNotificationAsync(
                payment.Order.UserId,
                "Payment Confirmed",
                $"Payment of ₹{payment.Order.TotalAmount:N2} for order #{payment.Order.OrderNumber} was successful.",
                "Payment"
            );

            _logger.LogInformation("Webhook: Captured payment for RazorpayOrderId={RzpOrderId}", razorpayOrderId);
            return true;
        }
        else if (eventName == "payment.failed")
        {
            if (!doc.RootElement.TryGetProperty("payload", out var wPayload)) return false;
            if (!wPayload.TryGetProperty("payment", out var pEntity)) return false;
            if (!pEntity.TryGetProperty("entity", out var entity)) return false;

            var razorpayOrderId = entity.TryGetProperty("order_id", out var oid) ? oid.GetString() : null;
            var errorDesc = entity.TryGetProperty("error_description", out var ed) ? ed.GetString() : "Payment failed";

            if (razorpayOrderId == null) return false;

            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.RazorpayOrderId == razorpayOrderId);
            if (payment == null) return false;

            if (payment.Status != PaymentStatus.Captured.ToString())
            {
                payment.Status = PaymentStatus.Failed.ToString();
                payment.FailureReason = errorDesc;
                await _context.SaveChangesAsync();
                _logger.LogInformation("Webhook: Payment failed for RazorpayOrderId={RzpOrderId}", razorpayOrderId);
            }

            return true;
        }

        return true; // Unknown event — acknowledge and return
    }

    public async Task<PaymentDto?> GetPaymentByOrderIdAsync(Guid orderId)
    {
        var p = await _context.Payments.FirstOrDefaultAsync(x => x.OrderId == orderId);
        if (p == null) return null;

        return new PaymentDto
        {
            Id = p.Id,
            OrderId = p.OrderId,
            RazorpayOrderId = p.RazorpayOrderId,
            RazorpayPaymentId = p.RazorpayPaymentId,
            Amount = p.Amount,
            Currency = p.Currency,
            Status = p.Status,
            PaymentMethod = p.PaymentMethod,
            CreatedAt = p.CreatedAt
        };
    }

    private static byte[] ComputeHmacSha256Bytes(string data, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        return hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
    }

    private static byte[] HexToBytes(string hex)
    {
        if (hex.Length % 2 != 0)
            throw new ArgumentException("Invalid hex string length.");
        var bytes = new byte[hex.Length / 2];
        for (int i = 0; i < bytes.Length; i++)
            bytes[i] = Convert.ToByte(hex.Substring(i * 2, 2), 16);
        return bytes;
    }

    private (string KeyId, string KeySecret) GetRazorpayCredentials()
    {
        var keyId = (_configuration["Razorpay:KeyId"] ?? "").Trim();
        var keySecret = (_configuration["Razorpay:KeySecret"] ?? "").Trim();

        // Fallback if environment variable has placeholder or is empty
        if (string.IsNullOrWhiteSpace(keyId) || keyId.Contains("FROM_ENV") || keyId.Contains("KRISHNA_DEV_KEY"))
        {
            keyId = "rzp_test_TcDuNKRhNEoDem";
        }

        // For this verified test key, always ensure the exact matching secret is used
        if (keyId == "rzp_test_TcDuNKRhNEoDem")
        {
            keySecret = "qsYewijSahtfRXkO1cE84VM2";
        }
        else if (string.IsNullOrWhiteSpace(keySecret) || keySecret.Contains("FROM_ENV") || keySecret == "Welcome@123" || keySecret.Length < 16)
        {
            keySecret = "qsYewijSahtfRXkO1cE84VM2";
        }

        return (keyId, keySecret);
    }

    private string GetWebhookSecret()
    {
        var secret = (_configuration["Razorpay:WebhookSecret"] ?? "").Trim();
        if (string.IsNullOrWhiteSpace(secret) || secret.Contains("FROM_ENV"))
        {
            secret = "Welcome@123";
        }
        return secret;
    }
}
