using KrishnaAccessories.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;

namespace KrishnaAccessories.Infrastructure.Services;

public class LocalStorageImageStorageService : IImageStorageService
{
    private readonly IWebHostEnvironment _env;

    public LocalStorageImageStorageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SaveImageAsync(Stream imageStream, string fileName, string contentType)
    {
        var uploadFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "products");
        if (!Directory.Exists(uploadFolder))
        {
            Directory.CreateDirectory(uploadFolder);
        }

        var ext = Path.GetExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(uploadFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await imageStream.CopyToAsync(fileStream);
        }

        return $"/uploads/products/{uniqueFileName}";
    }

    public Task<bool> DeleteImageAsync(string imageUrl)
    {
        try
        {
            if (string.IsNullOrEmpty(imageUrl)) return Task.FromResult(false);
            var relativePath = imageUrl.TrimStart('/');
            var fullPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), relativePath);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return Task.FromResult(true);
            }
        }
        catch
        {
            // Ignore deletion errors in storage
        }
        return Task.FromResult(false);
    }
}
