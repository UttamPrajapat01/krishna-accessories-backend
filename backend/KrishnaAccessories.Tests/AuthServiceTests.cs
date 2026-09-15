using KrishnaAccessories.Application.DTOs.Auth;
using KrishnaAccessories.Application.Exceptions;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Infrastructure.Data;
using KrishnaAccessories.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace KrishnaAccessories.Tests;

public class AuthServiceTests
{
    private ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task RegisterAsync_ValidDto_ReturnsSuccessResult()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var mockTokenService = new Mock<ITokenService>();
        mockTokenService.Setup(t => t.GenerateAccessToken(It.IsAny<User>())).Returns("valid_token_xyz");
        mockTokenService.Setup(t => t.GenerateRefreshToken(It.IsAny<Guid>()))
            .Returns(new RefreshToken { Token = "valid_refresh_xyz", ExpiresAt = DateTime.UtcNow.AddDays(7) });

        var authService = new AuthService(context, mockTokenService.Object);

        var dto = new RegisterDto
        {
            FullName = "Rajesh Verma",
            Email = "rajesh@example.com",
            Password = "Password123!",
            PhoneNumber = "9988776655"
        };

        // Act
        var result = await authService.RegisterAsync(dto);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("valid_token_xyz", result.Data.Token);
        Assert.Equal("rajesh@example.com", result.Data.User.Email);

        var userInDb = await context.Users.FirstOrDefaultAsync(u => u.Email == "rajesh@example.com");
        Assert.NotNull(userInDb);
        Assert.True(BCrypt.Net.BCrypt.Verify("Password123!", userInDb.PasswordHash));
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsBadRequestException()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        context.Users.Add(new User
        {
            Email = "duplicate@example.com",
            FullName = "Existing User",
            PasswordHash = "hashed"
        });
        await context.SaveChangesAsync();

        var mockTokenService = new Mock<ITokenService>();
        var authService = new AuthService(context, mockTokenService.Object);

        var dto = new RegisterDto
        {
            FullName = "Another User",
            Email = "duplicate@example.com",
            Password = "Password123!"
        };

        // Act & Assert
        await Assert.ThrowsAsync<BadRequestException>(() => authService.RegisterAsync(dto));
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsToken()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Secret123!");
        var user = new User
        {
            FullName = "Sneha Patel",
            Email = "sneha@example.com",
            PasswordHash = passwordHash,
            IsActive = true
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var mockTokenService = new Mock<ITokenService>();
        mockTokenService.Setup(t => t.GenerateAccessToken(It.IsAny<User>())).Returns("sneha_jwt_token");
        mockTokenService.Setup(t => t.GenerateRefreshToken(It.IsAny<Guid>()))
            .Returns(new RefreshToken { Token = "sneha_refresh", ExpiresAt = DateTime.UtcNow.AddDays(7) });

        var authService = new AuthService(context, mockTokenService.Object);

        // Act
        var result = await authService.LoginAsync(new LoginDto
        {
            Email = "sneha@example.com",
            Password = "Secret123!"
        });

        // Assert
        Assert.True(result.Success);
        Assert.Equal("sneha_jwt_token", result.Data!.Token);
    }
}
