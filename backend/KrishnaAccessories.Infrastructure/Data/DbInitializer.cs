using KrishnaAccessories.Core.Entities;
using KrishnaAccessories.Core.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace KrishnaAccessories.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        try
        {
            await context.Database.MigrateAsync();

            if (!await context.Users.AnyAsync())
            {
                logger.LogInformation("Seeding default roles and users...");

                var adminUser = new User
                {
                    FullName = "Krishna Admin",
                    Email = "admin@krishnaaccessories.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123456"),
                    PhoneNumber = "9876543210",
                    Role = UserRoles.Admin,
                    IsActive = true
                };

                var customerUser = new User
                {
                    FullName = "Aarav Sharma",
                    Email = "customer@krishnaaccessories.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123456"),
                    PhoneNumber = "9123456780",
                    Role = UserRoles.Customer,
                    IsActive = true
                };

                context.Users.AddRange(adminUser, customerUser);
                await context.SaveChangesAsync();

                // Add default address for sample customer
                context.Addresses.Add(new Address
                {
                    UserId = customerUser.Id,
                    FullName = "Aarav Sharma",
                    Phone = "9123456780",
                    AddressLine1 = "Penthouse 14, Royal Palms Residency",
                    AddressLine2 = "MG Road",
                    City = "Bengaluru",
                    State = "Karnataka",
                    PostalCode = "560001",
                    Country = "India",
                    IsDefault = true
                });
            }

            if (!await context.Categories.AnyAsync())
            {
                logger.LogInformation("Seeding categories and brands...");

                var catWatches = new Category { Name = "Watches", Slug = "watches", Description = "Luxury Swiss & Japanese chronographs and statement timepieces.", ImageUrl = "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80", DisplayOrder = 1 };
                var catBags = new Category { Name = "Bags", Slug = "bags", Description = "Handcrafted genuine leather bags, briefcases & clutches.", ImageUrl = "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", DisplayOrder = 2 };
                var catSunglasses = new Category { Name = "Sunglasses", Slug = "sunglasses", Description = "Polarized UV-protected designer eyewear with gold metal accents.", ImageUrl = "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80", DisplayOrder = 3 };
                var catFootwear = new Category { Name = "Footwear", Slug = "footwear", Description = "Bespoke formal oxfords, loafers, and luxury sneakers.", ImageUrl = "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80", DisplayOrder = 4 };
                var catJewellery = new Category { Name = "Jewellery", Slug = "jewellery", Description = "18k gold plated chains, diamond cut cufflinks & signature rings.", ImageUrl = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80", DisplayOrder = 5 };
                var catClothing = new Category { Name = "Clothing", Slug = "clothing", Description = "Premium bespoke silk shirts, tailored jackets & evening wear.", ImageUrl = "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80", DisplayOrder = 6 };
                var catAccessories = new Category { Name = "Accessories", Slug = "accessories", Description = "Italian leather wallets, automatic buckles & signature pocket squares.", ImageUrl = "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80", DisplayOrder = 7 };

                context.Categories.AddRange(catWatches, catBags, catSunglasses, catFootwear, catJewellery, catClothing, catAccessories);

                var bTitan = new Brand { Name = "Titan", Slug = "titan", Description = "India's pinnacle of precision horology." };
                var bFastrack = new Brand { Name = "Fastrack", Slug = "fastrack", Description = "Bold, contemporary youth fashion gear." };
                var bCasio = new Brand { Name = "Casio", Slug = "casio", Description = "Legendary Japanese engineering and G-Shock resilience." };
                var bFossil = new Brand { Name = "Fossil", Slug = "fossil", Description = "Timeless vintage American craftsmanship." };
                var bSonata = new Brand { Name = "Sonata", Slug = "sonata", Description = "Elegant daily style accessories." };
                var bRado = new Brand { Name = "Rado", Slug = "rado", Description = "Master of high-tech ceramic luxury Swiss timepieces." };
                var bRayBan = new Brand { Name = "Ray-Ban", Slug = "ray-ban", Description = "The global icon of classic aviator & wayfarer eyewear." };
                var bOakley = new Brand { Name = "Oakley", Slug = "oakley", Description = "High-performance polarized athletic sunglasses." };
                var bNike = new Brand { Name = "Nike", Slug = "nike", Description = "Supreme sportswear, sneakers and athletic gear." };
                var bAdidas = new Brand { Name = "Adidas", Slug = "adidas", Description = "Iconic three-stripe luxury streetwear and footwear." };

                context.Brands.AddRange(bTitan, bFastrack, bCasio, bFossil, bSonata, bRado, bRayBan, bOakley, bNike, bAdidas);
                await context.SaveChangesAsync();

                logger.LogInformation("Seeding products and initial inventory...");

                var products = new List<Product>
                {
                    new Product
                    {
                        Name = "Titan Regalia Sovereign Chronograph",
                        SKU = "WAT-TIT-001",
                        ShortDescription = "Champagne dial with 18k gold PVD coating.",
                        Description = "The Titan Regalia Sovereign embodies timeless elegance. Featuring an intricate champagne multi-dial chronograph, scratch-resistant sapphire crystal, and an authentic stainless steel mesh bracelet finished in radiant yellow gold.",
                        CategoryId = catWatches.Id,
                        BrandId = bTitan.Id,
                        Price = 14999m,
                        MRP = 18999m,
                        Discount = 21m,
                        StockQuantity = 25,
                        IsActive = true,
                        IsFeatured = true,
                        IsBestSeller = true,
                        Images = new List<ProductImage>
                        {
                            new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80", IsMain = true, DisplayOrder = 0 },
                            new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80", IsMain = false, DisplayOrder = 1 }
                        }
                    },
                    new Product
                    {
                        Name = "Rado DiaMaster Ceramic Automatic",
                        SKU = "WAT-RAD-002",
                        ShortDescription = "Plasma high-tech ceramic case with Swiss movement.",
                        Description = "Engineered with Rado's proprietary plasma ceramic technology, this masterpiece shines with a metallic sheen without containing metal. Powered by an 80-hour power reserve Swiss automatic movement with transparent sapphire case back.",
                        CategoryId = catWatches.Id,
                        BrandId = bRado.Id,
                        Price = 185000m,
                        MRP = 210000m,
                        Discount = 12m,
                        StockQuantity = 5,
                        IsActive = true,
                        IsFeatured = true,
                        IsBestSeller = false,
                        Images = new List<ProductImage>
                        {
                            new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1547996160-71dfabb18776?auto=format&fit=crop&w=800&q=80", IsMain = true, DisplayOrder = 0 }
                        }
                    },
                    new Product
                    {
                        Name = "Fossil Grant Chronograph Luggage Leather",
                        SKU = "WAT-FOS-003",
                        ShortDescription = "Rich amber leather strap with navy sunray dial.",
                        Description = "Modeled after vintage clocks, this Grant watch features Roman numeral indexes and a rich navy blue dial paired with supple genuine luggage brown leather strap.",
                        CategoryId = catWatches.Id,
                        BrandId = bFossil.Id,
                        Price = 11495m,
                        MRP = 13995m,
                        Discount = 18m,
                        StockQuantity = 18,
                        IsActive = true,
                        IsFeatured = false,
                        IsBestSeller = true,
                        Images = new List<ProductImage>
                        {
                            new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80", IsMain = true, DisplayOrder = 0 }
                        }
                    },
                    new Product
                    {
                        Name = "Ray-Ban Aviator Classic Gold Edition",
                        SKU = "SUN-RAY-001",
                        ShortDescription = "Polished gold metal frame with G-15 green polarized lenses.",
                        Description = "Originally designed in 1937 for US aviators, the iconic Ray-Ban Aviator Classic provides legendary clarity and complete UV400 solar protection.",
                        CategoryId = catSunglasses.Id,
                        BrandId = bRayBan.Id,
                        Price = 10290m,
                        MRP = 12590m,
                        Discount = 18m,
                        StockQuantity = 30,
                        IsActive = true,
                        IsFeatured = true,
                        IsBestSeller = true,
                        Images = new List<ProductImage>
                        {
                            new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80", IsMain = true, DisplayOrder = 0 }
                        }
                    },
                    new Product
                    {
                        Name = "Oakley Holbrook Polarized Prizm",
                        SKU = "SUN-OAK-002",
                        ShortDescription = "Matte black frame with sapphire mirror Prizm optics.",
                        Description = "Holbrook is a timeless classic design fused with modern Oakley technology. Featuring metal rivets and Oakley icons, perfect for both luxury style and outdoor performance.",
                        CategoryId = catSunglasses.Id,
                        BrandId = bOakley.Id,
                        Price = 12990m,
                        MRP = 15990m,
                        Discount = 19m,
                        StockQuantity = 14,
                        IsActive = true,
                        IsFeatured = false,
                        IsBestSeller = false,
                        Images = new List<ProductImage>
                        {
                            new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80", IsMain = true, DisplayOrder = 0 }
                        }
                    },
                    new Product
                    {
                        Name = "Milanese Full-Grain Leather Executive Briefcase",
                        SKU = "BAG-MIL-001",
                        ShortDescription = "Hand-burnished Italian vegetable-tanned leather.",
                        Description = "Crafted for the discerning professional, this executive briefcase fits up to 16-inch laptops with padded micro-suede compartments and brass hardware.",
                        CategoryId = catBags.Id,
                        BrandId = bFossil.Id,
                        Price = 19999m,
                        MRP = 24999m,
                        Discount = 20m,
                        StockQuantity = 8,
                        IsActive = true,
                        IsFeatured = true,
                        IsBestSeller = true,
                        Images = new List<ProductImage>
                        {
                            new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", IsMain = true, DisplayOrder = 0 }
                        }
                    },
                    new Product
                    {
                        Name = "Nike Air Max Pulse Obsidian Gold",
                        SKU = "SNE-NIK-001",
                        ShortDescription = "Point-loaded Air cushioning with premium leather details.",
                        Description = "Drawing inspiration from London music culture, the Air Max Pulse features a plush textile wrap, metallic gold swoosh emblem, and durable rubber waffle outsole.",
                        CategoryId = catFootwear.Id,
                        BrandId = bNike.Id,
                        Price = 13995m,
                        MRP = 16995m,
                        Discount = 18m,
                        StockQuantity = 22,
                        IsActive = true,
                        IsFeatured = true,
                        IsBestSeller = true,
                        Images = new List<ProductImage>
                        {
                            new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", IsMain = true, DisplayOrder = 0 }
                        }
                    },
                    new Product
                    {
                        Name = "Adidas Ultraboost Light Metallic Luxe",
                        SKU = "SNE-ADI-002",
                        ShortDescription = "30% lighter Light BOOST with gold foil accents.",
                        Description = "Experience epic energy return with the lightest Ultraboost ever. Engineered with Primeknit+ FORGED textile upper that molds like a second skin.",
                        CategoryId = catFootwear.Id,
                        BrandId = bAdidas.Id,
                        Price = 17999m,
                        MRP = 21999m,
                        Discount = 18m,
                        StockQuantity = 15,
                        IsActive = true,
                        IsFeatured = false,
                        IsBestSeller = true,
                        Images = new List<ProductImage>
                        {
                            new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80", IsMain = true, DisplayOrder = 0 }
                        }
                    },
                    new Product
                    {
                        Name = "18K Gold Plated Royal Signet Ring",
                        SKU = "JWL-RNG-001",
                        ShortDescription = "Deep onyx stone framed in hand-carved gold filigree.",
                        Description = "An heirloom statement piece. Handcrafted in solid 925 sterling silver dipped in 5 microns of 18-karat yellow gold with a genuine black onyx gemstone.",
                        CategoryId = catJewellery.Id,
                        BrandId = bTitan.Id,
                        Price = 7499m,
                        MRP = 9999m,
                        Discount = 25m,
                        StockQuantity = 12,
                        IsActive = true,
                        IsFeatured = true,
                        IsBestSeller = false,
                        Images = new List<ProductImage>
                        {
                            new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80", IsMain = true, DisplayOrder = 0 }
                        }
                    },
                    new Product
                    {
                        Name = "Krishna Signature Heritage Cufflinks",
                        SKU = "JWL-CUF-002",
                        ShortDescription = "Mother of pearl with diamond facet border.",
                        Description = "Add regal refinement to any French cuff shirt. Hand-finished with iridescent natural mother-of-pearl cabochon and secure swivel bar closure.",
                        CategoryId = catJewellery.Id,
                        BrandId = bTitan.Id,
                        Price = 4999m,
                        MRP = 6499m,
                        Discount = 23m,
                        StockQuantity = 35,
                        IsActive = true,
                        IsFeatured = false,
                        IsBestSeller = true,
                        Images = new List<ProductImage>
                        {
                            new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80", IsMain = true, DisplayOrder = 0 }
                        }
                    },
                    new Product
                    {
                        Name = "Casio G-Shock Full Metal 5000 Gold",
                        SKU = "WAT-CAS-004",
                        ShortDescription = "Solar-powered Bluetooth multi-band 6 chronometer.",
                        Description = "The iconic square G-Shock case reimagined in solid stainless steel with a brilliant gold-tone ion plated finish, Tough Solar power and Phone Finder sync.",
                        CategoryId = catWatches.Id,
                        BrandId = bCasio.Id,
                        Price = 42995m,
                        MRP = 49995m,
                        Discount = 14m,
                        StockQuantity = 9,
                        IsActive = true,
                        IsFeatured = true,
                        IsBestSeller = true,
                        Images = new List<ProductImage>
                        {
                            new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80", IsMain = true, DisplayOrder = 0 }
                        }
                    },
                    new Product
                    {
                        Name = "Fastrack Reflex Beat Plus Smartwatch",
                        SKU = "WAT-FAS-005",
                        ShortDescription = "1.69 inch UltraVU display with continuous health monitor.",
                        Description = "Sleek obsidian casing, 60+ sports modes, SpO2 sensor, and up to 5 days battery life tailored for active, fast-paced lifestyles.",
                        CategoryId = catWatches.Id,
                        BrandId = bFastrack.Id,
                        Price = 2495m,
                        MRP = 3995m,
                        Discount = 38m,
                        StockQuantity = 40,
                        IsActive = true,
                        IsFeatured = false,
                        IsBestSeller = true,
                        Images = new List<ProductImage>
                        {
                            new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80", IsMain = true, DisplayOrder = 0 }
                        }
                    },
                    new Product
                    {
                        Name = "Italian Reversible Leather Belt with Automatic Buckle",
                        SKU = "ACC-BLT-001",
                        ShortDescription = "Black to Burgundy reversible top-grain cowhide.",
                        Description = "Switch between jet black and deep burgundy in one effortless twist. Micro-ratchet buckle ensures a precision fit with zero pin holes.",
                        CategoryId = catAccessories.Id,
                        BrandId = bFossil.Id,
                        Price = 3499m,
                        MRP = 4499m,
                        Discount = 22m,
                        StockQuantity = 50,
                        IsActive = true,
                        IsFeatured = false,
                        IsBestSeller = true,
                        Images = new List<ProductImage>
                        {
                            new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80", IsMain = true, DisplayOrder = 0 }
                        }
                    }
                };

                foreach (var p in products)
                {
                    p.Inventory = new Inventory
                    {
                        QuantityAvailable = p.StockQuantity,
                        QuantityReserved = 0,
                        LowStockThreshold = 5,
                        LastRestockedAt = DateTime.UtcNow
                    };
                }

                context.Products.AddRange(products);
                await context.SaveChangesAsync();

                // Add sample reviews
                var sampleCustomer = await context.Users.FirstAsync(u => u.Email == "customer@krishnaaccessories.com");
                var sampleProduct = products.First();

                context.Reviews.Add(new Review
                {
                    ProductId = sampleProduct.Id,
                    UserId = sampleCustomer.Id,
                    Rating = 5,
                    Comment = "Exquisite craftsmanship! The gold finish and weight feel truly royal on the wrist. Highly recommended!",
                    IsApproved = true
                });

                // Add sample coupons
                context.Coupons.AddRange(
                    new Coupon
                    {
                        Code = "WELCOME10",
                        DiscountType = "Percentage",
                        DiscountValue = 10,
                        MinimumOrderAmount = 1000,
                        MaxDiscountAmount = 2000,
                        IsActive = true
                    },
                    new Coupon
                    {
                        Code = "KRISHNA500",
                        DiscountType = "FixedAmount",
                        DiscountValue = 500,
                        MinimumOrderAmount = 2500,
                        IsActive = true
                    }
                );

                await context.SaveChangesAsync();
                logger.LogInformation("Database seeded successfully with luxury catalog!");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}
