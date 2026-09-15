namespace KrishnaAccessories.Application.Interfaces;

public interface IImageStorageService
{
    Task<string> SaveImageAsync(Stream imageStream, string fileName, string contentType);
    Task<bool> DeleteImageAsync(string imageUrl);
}
