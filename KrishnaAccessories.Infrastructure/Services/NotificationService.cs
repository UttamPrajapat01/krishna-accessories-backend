using KrishnaAccessories.Application.DTOs.Notifications;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace KrishnaAccessories.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;

    public NotificationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                DataJson = n.DataJson,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<bool> MarkAsReadAsync(Guid userId, Guid notificationId)
    {
        var n = await _context.Notifications.FirstOrDefaultAsync(x => x.Id == notificationId && x.UserId == userId);
        if (n != null)
        {
            n.IsRead = true;
            await _context.SaveChangesAsync();
        }
        return true;
    }

    public async Task SendNotificationAsync(Guid userId, string title, string message, string type = "Order", string? dataJson = null)
    {
        var notif = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            DataJson = dataJson,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notif);
        await _context.SaveChangesAsync();
    }

    public async Task BroadcastNotificationAsync(string title, string message, string type = "Promo")
    {
        var userIds = await _context.Users.Where(u => u.IsActive).Select(u => u.Id).ToListAsync();
        var notifications = userIds.Select(id => new Notification
        {
            UserId = id,
            Title = title,
            Message = message,
            Type = type,
            CreatedAt = DateTime.UtcNow
        });

        _context.Notifications.AddRange(notifications);
        await _context.SaveChangesAsync();
    }
}
