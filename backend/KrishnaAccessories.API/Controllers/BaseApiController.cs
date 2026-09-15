using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace KrishnaAccessories.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected Guid CurrentUserId
    {
        get
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(idClaim, out var userId))
            {
                return userId;
            }
            return Guid.Empty;
        }
    }
}
