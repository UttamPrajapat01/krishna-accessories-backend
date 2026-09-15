using KrishnaAccessories.Application.DTOs.Address;

namespace KrishnaAccessories.Application.Interfaces;

public interface IAddressService
{
    Task<List<AddressDto>> GetUserAddressesAsync(Guid userId);
    Task<AddressDto> GetAddressByIdAsync(Guid userId, Guid addressId);
    Task<AddressDto> CreateAddressAsync(Guid userId, CreateAddressDto dto);
    Task<AddressDto> UpdateAddressAsync(Guid userId, Guid addressId, UpdateAddressDto dto);
    Task<bool> DeleteAddressAsync(Guid userId, Guid addressId);
    Task<bool> SetDefaultAddressAsync(Guid userId, Guid addressId);
}
