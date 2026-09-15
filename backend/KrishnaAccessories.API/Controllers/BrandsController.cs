using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Brands;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KrishnaAccessories.API.Controllers;

public class BrandsController : BaseApiController
{
    private readonly IBrandService _brandService;

    public BrandsController(IBrandService brandService)
    {
        _brandService = brandService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<BrandDto>>>> GetAll([FromQuery] bool includeInactive = false)
    {
        var result = await _brandService.GetAllBrandsAsync(includeInactive);
        return Ok(ApiResponse<List<BrandDto>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<BrandDto>>> GetById(Guid id)
    {
        var result = await _brandService.GetBrandByIdAsync(id);
        return Ok(ApiResponse<BrandDto>.SuccessResult(result));
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<BrandDto>>> Create([FromBody] CreateBrandDto dto)
    {
        var result = await _brandService.CreateBrandAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<BrandDto>.SuccessResult(result, "Brand created successfully"));
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<BrandDto>>> Update(Guid id, [FromBody] UpdateBrandDto dto)
    {
        var result = await _brandService.UpdateBrandAsync(id, dto);
        return Ok(ApiResponse<BrandDto>.SuccessResult(result, "Brand updated successfully"));
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var result = await _brandService.DeleteBrandAsync(id);
        return Ok(ApiResponse<bool>.SuccessResult(result, "Brand deleted successfully"));
    }
}
