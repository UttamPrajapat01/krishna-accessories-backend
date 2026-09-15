using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Auth;

namespace KrishnaAccessories.Application.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto dto);
    Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto);
    Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto dto);
    Task<ApiResponse<bool>> LogoutAsync(Guid userId);
    Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId);
}
