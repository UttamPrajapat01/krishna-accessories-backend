using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Orders;

namespace KrishnaAccessories.Application.Interfaces;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderDto dto);
    Task<PagedResult<OrderDto>> GetUserOrdersAsync(Guid userId, int pageNumber = 1, int pageSize = 10);
    Task<OrderDto> GetOrderByIdAsync(Guid userId, Guid orderId, bool isAdmin = false);
    Task<bool> CancelOrderAsync(Guid userId, Guid orderId);
    Task<PagedResult<OrderDto>> GetAllOrdersAdminAsync(int pageNumber = 1, int pageSize = 20, string? status = null);
    Task<OrderDto> UpdateOrderStatusAdminAsync(Guid orderId, UpdateOrderStatusDto dto);
}
