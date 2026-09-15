using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Notifications;
using KrishnaAccessories.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KrishnaAccessories.API.Controllers;

[Authorize]
public class NotificationsController : BaseApiController
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> GetNotifications()
    {
        var result = await _notificationService.GetUserNotificationsAsync(CurrentUserId);
        return Ok(ApiResponse<List<NotificationDto>>.SuccessResult(result));
    }

    [HttpPut("{id:guid}/read")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAsRead(Guid id)
    {
        var result = await _notificationService.MarkAsReadAsync(CurrentUserId, id);
        return Ok(ApiResponse<bool>.SuccessResult(result, "Marked as read"));
    }
}
