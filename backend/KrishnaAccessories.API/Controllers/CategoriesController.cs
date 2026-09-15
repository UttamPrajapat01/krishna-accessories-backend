using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Categories;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KrishnaAccessories.API.Controllers;

public class CategoriesController : BaseApiController
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetAll([FromQuery] bool includeInactive = false)
    {
        var result = await _categoryService.GetAllCategoriesAsync(includeInactive);
        return Ok(ApiResponse<List<CategoryDto>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetById(Guid id)
    {
        var result = await _categoryService.GetCategoryByIdAsync(id);
        return Ok(ApiResponse<CategoryDto>.SuccessResult(result));
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Create([FromBody] CreateCategoryDto dto)
    {
        var result = await _categoryService.CreateCategoryAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<CategoryDto>.SuccessResult(result, "Category created successfully"));
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Update(Guid id, [FromBody] UpdateCategoryDto dto)
    {
        var result = await _categoryService.UpdateCategoryAsync(id, dto);
        return Ok(ApiResponse<CategoryDto>.SuccessResult(result, "Category updated successfully"));
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var result = await _categoryService.DeleteCategoryAsync(id);
        return Ok(ApiResponse<bool>.SuccessResult(result, "Category deleted successfully"));
    }
}
