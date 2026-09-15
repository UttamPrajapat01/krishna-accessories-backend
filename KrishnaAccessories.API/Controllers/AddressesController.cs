using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Address;
using KrishnaAccessories.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KrishnaAccessories.API.Controllers;

[Authorize]
public class AddressesController : BaseApiController
{
    private readonly IAddressService _addressService;

    public AddressesController(IAddressService addressService)
    {
        _addressService = addressService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<AddressDto>>>> GetAddresses()
    {
        var result = await _addressService.GetUserAddressesAsync(CurrentUserId);
        return Ok(ApiResponse<List<AddressDto>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<AddressDto>>> GetAddressById(Guid id)
    {
        var result = await _addressService.GetAddressByIdAsync(CurrentUserId, id);
        return Ok(ApiResponse<AddressDto>.SuccessResult(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<AddressDto>>> CreateAddress([FromBody] CreateAddressDto dto)
    {
        var result = await _addressService.CreateAddressAsync(CurrentUserId, dto);
        return CreatedAtAction(nameof(GetAddressById), new { id = result.Id }, ApiResponse<AddressDto>.SuccessResult(result, "Address created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<AddressDto>>> UpdateAddress(Guid id, [FromBody] UpdateAddressDto dto)
    {
        var result = await _addressService.UpdateAddressAsync(CurrentUserId, id, dto);
        return Ok(ApiResponse<AddressDto>.SuccessResult(result, "Address updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteAddress(Guid id)
    {
        var result = await _addressService.DeleteAddressAsync(CurrentUserId, id);
        return Ok(ApiResponse<bool>.SuccessResult(result, "Address deleted successfully"));
    }

    [HttpPut("{id:guid}/default")]
    public async Task<ActionResult<ApiResponse<bool>>> SetDefault(Guid id)
    {
        var result = await _addressService.SetDefaultAddressAsync(CurrentUserId, id);
        return Ok(ApiResponse<bool>.SuccessResult(result, "Default address updated"));
    }
}
