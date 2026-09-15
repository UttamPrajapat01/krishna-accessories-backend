using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Orders;
using KrishnaAccessories.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KrishnaAccessories.API.Controllers;

[Authorize]
public class OrdersController : BaseApiController
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<OrderDto>>> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var result = await _orderService.CreateOrderAsync(CurrentUserId, dto);
        return Ok(ApiResponse<OrderDto>.SuccessResult(result, "Order created successfully"));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<OrderDto>>>> GetUserOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _orderService.GetUserOrdersAsync(CurrentUserId, page, pageSize);
        return Ok(ApiResponse<PagedResult<OrderDto>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> GetOrderById(Guid id)
    {
        var result = await _orderService.GetOrderByIdAsync(CurrentUserId, id);
        return Ok(ApiResponse<OrderDto>.SuccessResult(result));
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<ApiResponse<bool>>> CancelOrder(Guid id)
    {
        var result = await _orderService.CancelOrderAsync(CurrentUserId, id);
        return Ok(ApiResponse<bool>.SuccessResult(result, "Order cancelled successfully"));
    }
}
