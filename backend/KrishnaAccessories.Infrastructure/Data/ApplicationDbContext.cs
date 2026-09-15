using KrishnaAccessories.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace KrishnaAccessories.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<CouponUsage> CouponUsages => Set<CouponUsage>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(u => u.Id);
            b.HasIndex(u => u.Email).IsUnique();
            b.Property(u => u.Email).HasMaxLength(256).IsRequired();
            b.Property(u => u.FullName).HasMaxLength(150).IsRequired();
            b.Property(u => u.PasswordHash).IsRequired();
            b.Property(u => u.PhoneNumber).HasMaxLength(20);
        });

        // UserRole (composite key)
        modelBuilder.Entity<UserRole>(b =>
        {
            b.HasKey(ur => new { ur.UserId, ur.RoleId });
            b.HasOne(ur => ur.User).WithMany().HasForeignKey(ur => ur.UserId);
            b.HasOne(ur => ur.Role).WithMany().HasForeignKey(ur => ur.RoleId);
        });

        // Category
        modelBuilder.Entity<Category>(b =>
        {
            b.HasKey(c => c.Id);
            b.HasIndex(c => c.Slug).IsUnique();
            b.Property(c => c.Name).HasMaxLength(100).IsRequired();
            b.Property(c => c.Slug).HasMaxLength(100).IsRequired();
        });

        // Brand
        modelBuilder.Entity<Brand>(b =>
        {
            b.HasKey(br => br.Id);
            b.HasIndex(br => br.Slug).IsUnique();
            b.Property(br => br.Name).HasMaxLength(100).IsRequired();
            b.Property(br => br.Slug).HasMaxLength(100).IsRequired();
        });

        // Product
        modelBuilder.Entity<Product>(b =>
        {
            b.HasKey(p => p.Id);
            b.HasIndex(p => p.SKU).IsUnique();
            b.HasIndex(p => p.CategoryId);
            b.HasIndex(p => p.BrandId);
            b.HasIndex(p => p.IsActive);
            b.HasIndex(p => p.IsFeatured);
            b.HasIndex(p => p.IsBestSeller);

            b.Property(p => p.Name).HasMaxLength(200).IsRequired();
            b.Property(p => p.SKU).HasMaxLength(50).IsRequired();
            b.Property(p => p.Price).HasPrecision(18, 2);
            b.Property(p => p.MRP).HasPrecision(18, 2);
            b.Property(p => p.Discount).HasPrecision(18, 2);

            b.HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(p => p.Brand).WithMany(br => br.Products).HasForeignKey(p => p.BrandId).OnDelete(DeleteBehavior.Restrict);
        });

        // ProductImage
        modelBuilder.Entity<ProductImage>(b =>
        {
            b.HasKey(pi => pi.Id);
            b.HasOne(pi => pi.Product).WithMany(p => p.Images).HasForeignKey(pi => pi.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        // Cart & CartItem
        modelBuilder.Entity<Cart>(b =>
        {
            b.HasKey(c => c.Id);
            b.HasOne(c => c.User).WithOne(u => u.Cart).HasForeignKey<Cart>(c => c.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CartItem>(b =>
        {
            b.HasKey(ci => ci.Id);
            b.Property(ci => ci.UnitPrice).HasPrecision(18, 2);
            b.HasOne(ci => ci.Cart).WithMany(c => c.Items).HasForeignKey(ci => ci.CartId).OnDelete(DeleteBehavior.Cascade);
            b.HasOne(ci => ci.Product).WithMany().HasForeignKey(ci => ci.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        // Wishlist & WishlistItem
        modelBuilder.Entity<Wishlist>(b =>
        {
            b.HasKey(w => w.Id);
            b.HasOne(w => w.User).WithOne(u => u.Wishlist).HasForeignKey<Wishlist>(w => w.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WishlistItem>(b =>
        {
            b.HasKey(wi => wi.Id);
            b.HasOne(wi => wi.Wishlist).WithMany(w => w.Items).HasForeignKey(wi => wi.WishlistId).OnDelete(DeleteBehavior.Cascade);
            b.HasOne(wi => wi.Product).WithMany().HasForeignKey(wi => wi.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        // Address
        modelBuilder.Entity<Address>(b =>
        {
            b.HasKey(a => a.Id);
            b.HasOne(a => a.User).WithMany(u => u.Addresses).HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // Order & OrderItem
        modelBuilder.Entity<Order>(b =>
        {
            b.HasKey(o => o.Id);
            b.HasIndex(o => o.OrderNumber).IsUnique();
            b.HasIndex(o => o.UserId);
            b.HasIndex(o => o.OrderStatus);
            b.HasIndex(o => o.CreatedAt);

            b.Property(o => o.SubTotal).HasPrecision(18, 2);
            b.Property(o => o.TaxAmount).HasPrecision(18, 2);
            b.Property(o => o.ShippingAmount).HasPrecision(18, 2);
            b.Property(o => o.DiscountAmount).HasPrecision(18, 2);
            b.Property(o => o.TotalAmount).HasPrecision(18, 2);

            b.HasOne(o => o.User).WithMany(u => u.Orders).HasForeignKey(o => o.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OrderItem>(b =>
        {
            b.HasKey(oi => oi.Id);
            b.Property(oi => oi.UnitPrice).HasPrecision(18, 2);
            b.Property(oi => oi.TotalPrice).HasPrecision(18, 2);
            b.HasOne(oi => oi.Order).WithMany(o => o.Items).HasForeignKey(oi => oi.OrderId).OnDelete(DeleteBehavior.Cascade);
            b.HasOne(oi => oi.Product).WithMany().HasForeignKey(oi => oi.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        // Payment
        modelBuilder.Entity<Payment>(b =>
        {
            b.HasKey(p => p.Id);
            b.Property(p => p.Amount).HasPrecision(18, 2);
            b.HasOne(p => p.Order).WithOne(o => o.Payment).HasForeignKey<Payment>(p => p.OrderId).OnDelete(DeleteBehavior.Cascade);
        });

        // Inventory
        modelBuilder.Entity<Inventory>(b =>
        {
            b.HasKey(i => i.Id);
            b.HasOne(i => i.Product).WithOne(p => p.Inventory).HasForeignKey<Inventory>(i => i.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        // Coupon
        modelBuilder.Entity<Coupon>(b =>
        {
            b.HasKey(c => c.Id);
            b.HasIndex(c => c.Code).IsUnique();
            b.Property(c => c.DiscountValue).HasPrecision(18, 2);
            b.Property(c => c.MinimumOrderAmount).HasPrecision(18, 2);
            b.Property(c => c.MaxDiscountAmount).HasPrecision(18, 2);
        });

        // CouponUsage
        modelBuilder.Entity<CouponUsage>(b =>
        {
            b.HasKey(cu => cu.Id);
            b.Property(cu => cu.DiscountApplied).HasPrecision(18, 2);
            b.HasOne(cu => cu.Coupon).WithMany().HasForeignKey(cu => cu.CouponId);
            b.HasOne(cu => cu.User).WithMany().HasForeignKey(cu => cu.UserId);
            b.HasOne(cu => cu.Order).WithMany().HasForeignKey(cu => cu.OrderId);
        });

        // Review
        modelBuilder.Entity<Review>(b =>
        {
            b.HasKey(r => r.Id);
            b.HasOne(r => r.Product).WithMany(p => p.Reviews).HasForeignKey(r => r.ProductId).OnDelete(DeleteBehavior.Cascade);
            b.HasOne(r => r.User).WithMany(u => u.Reviews).HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // Notification
        modelBuilder.Entity<Notification>(b =>
        {
            b.HasKey(n => n.Id);
            b.HasOne(n => n.User).WithMany(u => u.Notifications).HasForeignKey(n => n.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
