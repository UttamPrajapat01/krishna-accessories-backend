using KrishnaAccessories.Application.DTOs.Orders;
using KrishnaAccessories.Application.DTOs.Products;

namespace KrishnaAccessories.Application.DTOs.Admin;

public class DashboardStatsDto
{
    public int TotalProducts { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public int DeliveredOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int LowStockProductsCount { get; set; }
    public List<OrderDto> RecentOrders { get; set; } = new();
    public List<ProductDto> LowStockProducts { get; set; } = new();
}
