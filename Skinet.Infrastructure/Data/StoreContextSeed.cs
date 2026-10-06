using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Skinet.Core.Entities;

namespace Skinet.Infrastructure.Data
{
    public class StoreContextSeed()
    {

        public static async Task SeedAsync(StoreContext context, UserManager<AppUser> userManager, IConfiguration config)
        {
            var email = config["AdminCredentials:Email"]!;
            var password = config["AdminCredentials:Password"]!;

            if (!userManager.Users.Any(x => x.UserName == email))
            {
                var user = new AppUser
                {
                    UserName = email,
                    Email = email,
                };

                await userManager.CreateAsync(user, password);
                await userManager.AddToRoleAsync(user, "Admin");

            }

            var path = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);

            if (!context.Products.Any())
            {
                var productData = await File.ReadAllTextAsync(path + @"/Data/SeedData/products.json");

                var products = JsonSerializer.Deserialize<List<Product>>(productData);

                if (products == null) return;

                context.Products.AddRange(products);

                await context.SaveChangesAsync();
            }
            if (!context.DeliveryMethods.Any())
            {
                var dmData = await File.ReadAllTextAsync(path + @"/Data/SeedData/delivery.json");

                var methods = JsonSerializer.Deserialize<List<DeliveryMethod>>(dmData);

                if (methods == null) return;

                context.DeliveryMethods.AddRange(methods);

                await context.SaveChangesAsync();
            }
        }
    }
}
