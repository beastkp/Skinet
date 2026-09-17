using System.Runtime.CompilerServices;
using System.Security.Authentication;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Skinet.Core.Entities;

namespace Skinet.API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static async Task<AppUser> GetUserByEmail(this UserManager<AppUser> userManager, ClaimsPrincipal user)
        {
            var userToReturn = await userManager.Users.FirstOrDefaultAsync(x => x.Email == user.GetEmail()) ?? 
                throw new AuthenticationException("User not found");
            return userToReturn;
        }
        public static async Task<AppUser> GetUserByEmailWithAddress(this UserManager<AppUser> userManager, ClaimsPrincipal user)
        {
            var userToReturn = await userManager.Users.Include(x => x.Address)
                .FirstOrDefaultAsync(x => x.Email == user.GetEmail()) ?? 
                throw new AuthenticationException("User not found");
            return userToReturn;
        }

        public static string GetEmail(this ClaimsPrincipal user)
        {
            var email = user.FindFirstValue(ClaimTypes.Email) ?? throw new AuthenticationException("Email Claim not found");
            return email;
        }
    }
}
