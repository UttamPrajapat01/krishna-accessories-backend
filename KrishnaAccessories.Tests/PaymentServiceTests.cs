using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using KrishnaAccessories.Application.DTOs.Payments;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Core.Enums;
using KrishnaAccessories.Infrastructure.Data;
using KrishnaAccessories.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace KrishnaAccessories.Tests;

public class PaymentServiceTests
{
    private ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    private PaymentService CreateService(ApplicationDbContext context, IConfiguration config, INotificationService notif)
    {
        // Mock IHttpClientFactory (unused in VerifyPayment, but required by constructor)
        var handlerMock = new Mock<HttpMessageHandler>();
        var httpClient = new HttpClient(handlerMock.Object);
        var httpClientFactoryMock = new Mock<IHttpClientFactory>();
        httpClientFactoryMock.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);

        var loggerMock = new Mock<ILogger<PaymentService>>();

        return new PaymentService(context, config, notif, httpClientFactoryMock.Object, loggerMock.Object);
    }

    [Fact]
    public async Task VerifyPaymentAsync_ValidSignature_UpdatesOrderAndPayment()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var order = new Order
        {
            OrderNumber = "KA-PAY-001",
            TotalAmount = 5000m,
            OrderStatus = OrderStatus.Pending.ToString(),
            PaymentStatus = PaymentStatus.Pending.ToString()
        };
        context.Orders.Add(order);
        await context.SaveChangesAsync();

        var secret = "MyTestSecretKey123";
        var configMock = new Mock<IConfiguration>();
        configMock.Setup(c => c["Razorpay:KeySecret"]).Returns(secret);
        configMock.Setup(c => c["Razorpay:KeyId"]).Returns("rzp_test_123");

        var notifMock = new Mock<INotificationService>();
        var paymentService = CreateService(context, configMock.Object, notifMock.Object);

        var razorpayOrderId = "order_123456789";
        var paymentId = "pay_987654321";

        // Compute real HMAC-SHA256 signature
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var rawSig = hmac.ComputeHash(Encoding.UTF8.GetBytes($"{razorpayOrderId}|{paymentId}"));
        var validSignature = BitConverter.ToString(rawSig).Replace("-", "").ToLowerInvariant();

        var verifyDto = new VerifyPaymentDto
        {
            OrderId = order.Id,
            RazorpayOrderId = razorpayOrderId,
            RazorpayPaymentId = paymentId,
            RazorpaySignature = validSignature
        };

        // Act
        var result = await paymentService.VerifyPaymentAsync(verifyDto);

        // Assert
        Assert.True(result);
        var updatedOrder = await context.Orders.FindAsync(order.Id);
        Assert.Equal(PaymentStatus.Captured.ToString(), updatedOrder!.PaymentStatus);
        Assert.Equal(OrderStatus.Confirmed.ToString(), updatedOrder.OrderStatus);
    }

    [Fact]
    public async Task VerifyPaymentAsync_AlreadyCaptured_ReturnsIdempotentSuccess()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var order = new Order
        {
            OrderNumber = "KA-PAY-002",
            TotalAmount = 3000m,
            OrderStatus = OrderStatus.Confirmed.ToString(),
            PaymentStatus = PaymentStatus.Captured.ToString()
        };
        context.Orders.Add(order);

        var payment = new Payment
        {
            OrderId = order.Id,
            RazorpayOrderId = "order_existing",
            RazorpayPaymentId = "pay_existing",
            Status = PaymentStatus.Captured.ToString(),
            Amount = 3000m,
            PaymentMethod = PaymentMethods.Razorpay
        };
        context.Payments.Add(payment);
        await context.SaveChangesAsync();

        var configMock = new Mock<IConfiguration>();
        configMock.Setup(c => c["Razorpay:KeySecret"]).Returns("secret");
        var notifMock = new Mock<INotificationService>();
        var paymentService = CreateService(context, configMock.Object, notifMock.Object);

        var dto = new VerifyPaymentDto
        {
            OrderId = order.Id,
            RazorpayOrderId = "order_existing",
            RazorpayPaymentId = "pay_existing",
            RazorpaySignature = "any_sig"
        };

        // Act — should not throw, should return true (idempotent)
        var result = await paymentService.VerifyPaymentAsync(dto);

        // Assert
        Assert.True(result);
    }
}
