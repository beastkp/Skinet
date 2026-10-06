using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Skinet.Infrastructure.Config
{
    public class RoleConfiguration : IEntityTypeConfiguration<IdentityRole>
    {
        public void Configure(EntityTypeBuilder<IdentityRole> builder)
        {
            builder.HasData(
                new IdentityRole { Id = "admin-Id", ConcurrencyStamp="admin", Name= "Admin", NormalizedName="ADMIN"},
                new IdentityRole { Id = "customer-Id", ConcurrencyStamp="customer", Name="Customer", NormalizedName="CUSTOMER"}

            );
        }
    }
}
