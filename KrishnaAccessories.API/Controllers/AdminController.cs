using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Admin;
using KrishnaAccessories.Application.DTOs.Auth;
using KrishnaAccessories.Application.DTOs.Coupons;
using KrishnaAccessories.Application.DTOs.Inventory;
using KrishnaAccessories.Application.DTOs.Orders;
using KrishnaAccessories.Application.DTOs.Reviews;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Enums;
using KrishnaAccessories.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KrishnaAccessories.API.Controllers;

[Authorize(Roles = UserRoles.Admin)]
public class AdminController : BaseApiController
{
    private readonly IDashboardService _dashboardService;
    private readonly IInventoryService _inventoryService;
    private readonly IOrderService _orderService;
    private readonly ICouponService _couponService;
    private readonly IReviewService _reviewService;
    private readonly INotificationService _notificationService;
    private readonly ApplicationDbContext _context;

    public AdminController(
        IDashboardService dashboardService,
        IInventoryService inventoryService,
        IOrderService orderService,
        ICouponService couponService,
        IReviewService reviewService,
        INotificationService notificationService,
        ApplicationDbContext context)
    {
        _dashboardService = dashboardService;
        _inventoryService = inventoryService;
        _orderService = orderService;
        _couponService = couponService;
        _reviewService = reviewService;
        _notificationService = notificationService;
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetDashboard()
    {
        var result = await _dashboardService.GetDashboardStatsAsync();
        return Ok(ApiResponse<DashboardStatsDto>.SuccessResult(result));
    }

    [HttpGet("inventory")]
    public async Task<ActionResult<ApiResponse<List<InventoryDto>>>> GetInventory()
    {
        var result = await _inventoryService.GetInventoryListAsync();
        return Ok(ApiResponse<List<InventoryDto>>.SuccessResult(result));
    }

    [HttpPut("inventory/{productId:guid}")]
    public async Task<ActionResult<ApiResponse<InventoryDto>>> UpdateInventory(Guid productId, [FromBody] UpdateInventoryDto dto)
    {
        var result = await _inventoryService.UpdateStockAsync(productId, dto);
        return Ok(ApiResponse<InventoryDto>.SuccessResult(result, "Inventory updated"));
    }

    [HttpGet("inventory/low-stock")]
    public async Task<ActionResult<ApiResponse<List<InventoryDto>>>> GetLowStock()
    {
        var result = await _inventoryService.GetLowStockAlertsAsync();
        return Ok(ApiResponse<List<InventoryDto>>.SuccessResult(result));
    }

    [HttpGet("orders")]
    public async Task<ActionResult<ApiResponse<PagedResult<OrderDto>>>> GetAllOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? status = null)
    {
        var result = await _orderService.GetAllOrdersAdminAsync(page, pageSize, status);
        return Ok(ApiResponse<PagedResult<OrderDto>>.SuccessResult(result));
    }

    [HttpPut("orders/{id:guid}/status")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
    {
        var result = await _orderService.UpdateOrderStatusAdminAsync(id, dto);
        return Ok(ApiResponse<OrderDto>.SuccessResult(result, "Order status updated successfully"));
    }

    [HttpGet("customers")]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetCustomers()
    {
        var customers = await _context.Users
            .Where(u => u.Role == UserRoles.Customer)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(ApiResponse<List<UserDto>>.SuccessResult(customers));
    }

    [HttpGet("coupons")]
    public async Task<ActionResult<ApiResponse<List<CouponDto>>>> GetCoupons()
    {
        var result = await _couponService.GetAllCouponsAsync();
        return Ok(ApiResponse<List<CouponDto>>.SuccessResult(result));
    }

    [HttpPost("coupons")]
    public async Task<ActionResult<ApiResponse<CouponDto>>> CreateCoupon([FromBody] CreateCouponDto dto)
    {
        var result = await _couponService.CreateCouponAsync(dto);
        return Ok(ApiResponse<CouponDto>.SuccessResult(result, "Coupon created successfully"));
    }

    [HttpDelete("coupons/{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCoupon(Guid id)
    {
        var result = await _couponService.DeleteCouponAsync(id);
        return Ok(ApiResponse<bool>.SuccessResult(result, "Coupon deleted successfully"));
    }

    [HttpGet("reviews")]
    public async Task<ActionResult<ApiResponse<List<ReviewDto>>>> GetAllReviews()
    {
        var result = await _reviewService.GetAllReviewsAdminAsync();
        return Ok(ApiResponse<List<ReviewDto>>.SuccessResult(result));
    }

    [HttpPut("reviews/{id:guid}/approve")]
    public async Task<ActionResult<ApiResponse<bool>>> ApproveReview(Guid id, [FromQuery] bool isApproved = true)
    {
        var result = await _reviewService.ApproveReviewAdminAsync(id, isApproved);
        return Ok(ApiResponse<bool>.SuccessResult(result, isApproved ? "Review approved" : "Review rejected"));
    }

    [HttpPost("notifications/broadcast")]
    public async Task<ActionResult<ApiResponse<bool>>> BroadcastNotification([FromBody] BroadcastRequest request)
    {
        await _notificationService.BroadcastNotificationAsync(request.Title, request.Message, request.Type);
        return Ok(ApiResponse<bool>.SuccessResult(true, "Notification broadcasted successfully"));
    }
}

public class BroadcastRequest
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "Promo";
}
