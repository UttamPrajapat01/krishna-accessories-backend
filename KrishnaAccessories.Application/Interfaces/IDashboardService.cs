using KrishnaAccessories.Application.DTOs.Admin;

namespace KrishnaAccessories.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
}
