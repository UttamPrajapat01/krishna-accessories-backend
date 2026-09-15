using KrishnaAccessories.Core.Entities;

namespace KrishnaAccessories.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    RefreshToken GenerateRefreshToken(Guid userId);
}
