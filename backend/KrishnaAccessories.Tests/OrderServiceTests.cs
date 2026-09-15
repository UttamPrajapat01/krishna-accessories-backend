using KrishnaAccessories.Application.DTOs.Orders;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Core.Enums;
using KrishnaAccessories.Infrastructure.Data;
using KrishnaAccessories.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace KrishnaAccessories.Tests;

public class OrderServiceTests
{
    private ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task CancelOrderAsync_RestocksInventory()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var user = new User { FullName = "Customer", Email = "cust@test.com", PasswordHash = "pwd" };
        var product = new Product
        {
            Name = "Aviator Sunglasses",
            SKU = "SUN-001",
            Price = 9000m,
            StockQuantity = 10,
            Inventory = new Inventory { QuantityAvailable = 10 }
        };

        var order = new Order
        {
            OrderNumber = "KA-TEST-001",
            UserId = user.Id,
            OrderStatus = OrderStatus.Pending.ToString(),
            TotalAmount = 9000m,
            Items = new List<OrderItem>
            {
                new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    UnitPrice = 9000m,
                    Quantity = 3,
                    TotalPrice = 27000m
                }
            }
        };

        context.Users.Add(user);
        context.Products.Add(product);
        context.Orders.Add(order);
        await context.SaveChangesAsync();

        var mockCouponService = new Mock<ICouponService>();
        var mockNotifService = new Mock<INotificationService>();
        var orderService = new OrderService(context, mockCouponService.Object, mockNotifService.Object);

        // Act
        var result = await orderService.CancelOrderAsync(user.Id, order.Id);

        // Assert
        Assert.True(result);
        var updatedOrder = await context.Orders.FindAsync(order.Id);
        Assert.Equal(OrderStatus.Cancelled.ToString(), updatedOrder!.OrderStatus);

        var updatedProduct = await context.Products.Include(p => p.Inventory).FirstAsync(p => p.Id == product.Id);
        // Initial 10 + 3 returned = 13
        Assert.Equal(13, updatedProduct.StockQuantity);
        Assert.Equal(13, updatedProduct.Inventory!.QuantityAvailable);
    }
}
