namespace KrishnaAccessories.Core.Entities;

public class Wishlist
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<WishlistItem> Items { get; set; } = new List<WishlistItem>();
}
