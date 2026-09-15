using KrishnaAccessories.Application.DTOs.Notifications;

namespace KrishnaAccessories.Application.Interfaces;

public interface INotificationService
{
    Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId);
    Task<bool> MarkAsReadAsync(Guid userId, Guid notificationId);
    Task SendNotificationAsync(Guid userId, string title, string message, string type = "Order", string? dataJson = null);
    Task BroadcastNotificationAsync(string title, string message, string type = "Promo");
}
