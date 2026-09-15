using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.DTOs.Products;
using KrishnaAccessories.Application.Interfaces;
using KrishnaAccessories.Core.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KrishnaAccessories.API.Controllers;

public class ProductsController : BaseApiController
{
    private readonly IProductService _productService;
    private readonly IImageStorageService _imageStorageService;

    public ProductsController(IProductService productService, IImageStorageService imageStorageService)
    {
        _productService = productService;
        _imageStorageService = imageStorageService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ProductDto>>>> GetProducts([FromQuery] ProductFilterDto filter)
    {
        var result = await _productService.GetProductsAsync(filter);
        return Ok(ApiResponse<PagedResult<ProductDto>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetProductById(Guid id)
    {
        var result = await _productService.GetProductByIdAsync(id);
        return Ok(ApiResponse<ProductDto>.SuccessResult(result));
    }

    [HttpGet("featured")]
    public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetFeaturedProducts([FromQuery] int count = 8)
    {
        var result = await _productService.GetFeaturedProductsAsync(count);
        return Ok(ApiResponse<List<ProductDto>>.SuccessResult(result));
    }

    [HttpGet("bestsellers")]
    public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetBestSellers([FromQuery] int count = 8)
    {
        var result = await _productService.GetBestSellersAsync(count);
        return Ok(ApiResponse<List<ProductDto>>.SuccessResult(result));
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProductDto>>> CreateProduct([FromBody] CreateProductDto dto)
    {
        var result = await _productService.CreateProductAsync(dto);
        return CreatedAtAction(nameof(GetProductById), new { id = result.Id }, ApiResponse<ProductDto>.SuccessResult(result, "Product created successfully"));
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> UpdateProduct(Guid id, [FromBody] UpdateProductDto dto)
    {
        var result = await _productService.UpdateProductAsync(id, dto);
        return Ok(ApiResponse<ProductDto>.SuccessResult(result, "Product updated successfully"));
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteProduct(Guid id)
    {
        var result = await _productService.DeleteProductAsync(id);
        return Ok(ApiResponse<bool>.SuccessResult(result, "Product deleted successfully"));
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpPost("upload-image")]
    public async Task<ActionResult<ApiResponse<string>>> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<string>.ErrorResult("No image file provided."));
        }

        using var stream = file.OpenReadStream();
        var url = await _imageStorageService.SaveImageAsync(stream, file.FileName, file.ContentType);
        return Ok(ApiResponse<string>.SuccessResult(url, "Image uploaded successfully"));
    }
}
