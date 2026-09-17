using System.ComponentModel.DataAnnotations;

namespace Skinet.API.DTOs
{
    public class AddressDto
    {
        [Required]
        public string Line1 { get; set; } = string.Empty;

        public string? Line2 { get; set; }

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        public required string State { get; set; } = string.Empty;

        [Required]
        public required string PostalCode { get; set; } = string.Empty;

        [Required]
        public required string Country { get; set; } = string.Empty;
    }
}
