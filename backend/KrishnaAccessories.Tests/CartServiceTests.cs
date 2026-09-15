using KrishnaAccessories.Application.DTOs.Cart;
using KrishnaAccessories.Application.Exceptions;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Infrastructure.Data;
using KrishnaAccessories.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace KrishnaAccessories.Tests;

public class CartServiceTests
{
    private ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task AddItemAsync_UsesRealDatabaseProductPrice_NotClientPrice()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var user = new User { FullName = "User 1", Email = "u1@test.com", PasswordHash = "hash" };
        var category = new Category { Name = "Watches", Slug = "watches" };
        var brand = new Brand { Name = "Titan", Slug = "titan" };
        var product = new Product
        {
            Name = "Luxury Gold Watch",
            SKU = "WAT-001",
            Price = 15000m,
            MRP = 18000m,
            StockQuantity = 10,
            IsActive = true,
            Category = category,
            Brand = brand
        };

        context.Users.Add(user);
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var cartService = new CartService(context);

                // Act
        var cart = await cartService.AddItemAsync(user.Id, new AddToCartDto
        {
            ProductId = product.Id,
            Quantity = 2
        });

        // Assert: Price is taken from DB (15000 * 2 = 30000)
        Assert.Single(cart.Items);
        Assert.Equal(15000m, cart.Items[0].UnitPrice);
        Assert.Equal(30000m, cart.Items[0].TotalPrice);
        Assert.Equal(30000m, cart.SubTotal);
    }

    [Fact]
    public async Task AddItemAsync_ExceedingStock_ThrowsBadRequestException()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var user = new User { FullName = "User 2", Email = "u2@test.com", PasswordHash = "hash" };
        var category = new Category { Name = "Bags", Slug = "bags" };
        var brand = new Brand { Name = "Fossil", Slug = "fossil" };
        var product = new Product
        {
            Name = "Leather Bag",
            SKU = "BAG-001",
            Price = 5000m,
            MRP = 6000m,
            StockQuantity = 2,
            IsActive = true,
            Category = category,
            Brand = brand
        };

        context.Users.Add(user);
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var cartService = new CartService(context);

        // Act & Assert
        await Assert.ThrowsAsync<BadRequestException>(() =>
            cartService.AddItemAsync(user.Id, new AddToCartDto { ProductId = product.Id, Quantity = 5 }));
    }
}
