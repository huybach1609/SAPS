using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SAPS.Api.Dtos.Subscription
{
    public class SubscriptionResponseDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = null!;

        [JsonPropertyName("name")]
        public string Name { get; set; } = null!;

        [JsonPropertyName("duration")]
        public long Duration { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("price")]
        public double Price { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = null!;
    }

    public class CreateSubscriptionDto
    {
        [Required]
        [StringLength(255, MinimumLength = 1)]
        [JsonPropertyName("name")]
        public string Name { get; set; } = null!;

        [Required]
        [Range(1, long.MaxValue, ErrorMessage = "Duration must be greater than 0")]
        [JsonPropertyName("duration")]
        public long Duration { get; set; }

        [StringLength(500)]
        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        [JsonPropertyName("price")]
        public double Price { get; set; }

        [Required]
        [RegularExpression("^(active|inactive)$", ErrorMessage = "Status must be either 'active' or 'inactive'")]
        [JsonPropertyName("status")]
        public string Status { get; set; } = "active";
    }

    public class UpdateSubscriptionDto
    {
        [StringLength(255, MinimumLength = 1)]
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [StringLength(500)]
        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        [JsonPropertyName("price")]
        public double? Price { get; set; }

        [RegularExpression("^(active|inactive)$", ErrorMessage = "Status must be either 'active' or 'inactive'")]
        [JsonPropertyName("status")]
        public string? Status { get; set; }
    }
}