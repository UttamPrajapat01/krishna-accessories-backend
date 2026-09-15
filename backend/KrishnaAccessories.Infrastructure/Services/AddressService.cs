using KrishnaAccessories.Application.DTOs.Address;
using KrishnaAccessories.Application.Exceptions;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace KrishnaAccessories.Infrastructure.Services;

public class AddressService : IAddressService
{
    private readonly ApplicationDbContext _context;

    public AddressService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AddressDto>> GetUserAddressesAsync(Guid userId)
    {
        return await _context.Addresses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .Select(a => MapToDto(a))
            .ToListAsync();
    }

    public async Task<AddressDto> GetAddressByIdAsync(Guid userId, Guid addressId)
    {
        var a = await _context.Addresses.FirstOrDefaultAsync(x => x.Id == addressId && x.UserId == userId);
        if (a == null) throw new NotFoundException("Address", addressId);
        return MapToDto(a);
    }

    public async Task<AddressDto> CreateAddressAsync(Guid userId, CreateAddressDto dto)
    {
        if (dto.IsDefault)
        {
            var defaults = await _context.Addresses.Where(a => a.UserId == userId && a.IsDefault).ToListAsync();
            foreach (var d in defaults) d.IsDefault = false;
        }
        else
        {
            var hasAny = await _context.Addresses.AnyAsync(a => a.UserId == userId);
            if (!hasAny) dto.IsDefault = true; // First address is default
        }

        var digits = System.Text.RegularExpressions.Regex.Replace(dto.Phone ?? "", @"\D", "");
        var cleanPhone = digits.Length >= 10 ? digits[^10..] : digits;

        var address = new Address
        {
            UserId = userId,
            FullName = dto.FullName.Trim(),
            Phone = cleanPhone,
            AddressLine1 = dto.AddressLine1.Trim(),
            AddressLine2 = dto.AddressLine2?.Trim(),
            City = dto.City.Trim(),
            State = string.IsNullOrWhiteSpace(dto.State) ? "India" : dto.State.Trim(),
            PostalCode = dto.PostalCode.Trim(),
            Country = string.IsNullOrWhiteSpace(dto.Country) ? "India" : dto.Country.Trim(),
            IsDefault = dto.IsDefault
        };

        _context.Addresses.Add(address);
        await _context.SaveChangesAsync();
        return MapToDto(address);
    }

    public async Task<AddressDto> UpdateAddressAsync(Guid userId, Guid addressId, UpdateAddressDto dto)
    {
        var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);
        if (address == null) throw new NotFoundException("Address", addressId);

        if (dto.IsDefault && !address.IsDefault)
        {
            var defaults = await _context.Addresses.Where(a => a.UserId == userId && a.IsDefault).ToListAsync();
            foreach (var d in defaults) d.IsDefault = false;
        }

        address.FullName = dto.FullName.Trim();
        address.Phone = dto.Phone.Trim();
        address.AddressLine1 = dto.AddressLine1.Trim();
        address.AddressLine2 = dto.AddressLine2?.Trim();
        address.City = dto.City.Trim();
        address.State = dto.State.Trim();
        address.PostalCode = dto.PostalCode.Trim();
        address.Country = string.IsNullOrWhiteSpace(dto.Country) ? "India" : dto.Country.Trim();
        address.IsDefault = dto.IsDefault;

        await _context.SaveChangesAsync();
        return MapToDto(address);
    }

    public async Task<bool> DeleteAddressAsync(Guid userId, Guid addressId)
    {
        var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);
        if (address == null) throw new NotFoundException("Address", addressId);

        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetDefaultAddressAsync(Guid userId, Guid addressId)
    {
        var addresses = await _context.Addresses.Where(a => a.UserId == userId).ToListAsync();
        var target = addresses.FirstOrDefault(a => a.Id == addressId);
        if (target == null) throw new NotFoundException("Address", addressId);

        foreach (var a in addresses) a.IsDefault = (a.Id == addressId);
        await _context.SaveChangesAsync();
        return true;
    }

    private static AddressDto MapToDto(Address a) => new()
    {
        Id = a.Id,
        FullName = a.FullName,
        Phone = a.Phone,
        AddressLine1 = a.AddressLine1,
        AddressLine2 = a.AddressLine2,
        City = a.City,
        State = a.State,
        PostalCode = a.PostalCode,
        Country = a.Country,
        IsDefault = a.IsDefault
    };
}
