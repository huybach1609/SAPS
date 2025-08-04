using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SAPS.Api.Dtos.UserClient
{
    public class UserClientDetailDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = null!;

        [JsonPropertyName("fullName")]
        public string FullName { get; set; } = null!;

        [JsonPropertyName("email")]
        public string Email { get; set; } = null!;

        [JsonPropertyName("profileImageUrl")]
        public string? ProfileImageUrl { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = null!;

        [JsonPropertyName("verificationStatus")]
        public string VerificationStatus { get; set; } = "Verified";

        [JsonPropertyName("citizenId")]
        public string? CitizenId { get; set; }

        [JsonPropertyName("phone")]
        public string? Phone { get; set; }

        [JsonPropertyName("dateOfBirth")]
        public string? DateOfBirth { get; set; }

        [JsonPropertyName("address")]
        public string? Address { get; set; }

        [JsonPropertyName("registrationDate")]
        public string RegistrationDate { get; set; } = null!;

        [JsonPropertyName("lastLogin")]
        public string? LastLogin { get; set; }

        [JsonPropertyName("vehicles")]
        public List<VehicleInfoDto> Vehicles { get; set; } = new List<VehicleInfoDto>();

        [JsonPropertyName("sharedVehicles")]
        public List<SharedVehicleInfoDto> SharedVehicles { get; set; } = new List<SharedVehicleInfoDto>();

        [JsonPropertyName("parkingActivity")]
        public List<ParkingActivityDto> ParkingActivity { get; set; } = new List<ParkingActivityDto>();

        [JsonPropertyName("stats")]
        public UserStatsDto Stats { get; set; } = new UserStatsDto();
    }

    public class VehicleInfoDto
    {
        [JsonPropertyName("licensePlate")]
        public string LicensePlate { get; set; } = null!;

        [JsonPropertyName("model")]
        public string Model { get; set; } = null!;

        [JsonPropertyName("color")]
        public string Color { get; set; } = null!;

        [JsonPropertyName("registrationDate")]
        public string RegistrationDate { get; set; } = null!;

        [JsonPropertyName("status")]
        public string Status { get; set; } = null!;
    }

    public class SharedVehicleInfoDto
    {
        [JsonPropertyName("licensePlate")]
        public string LicensePlate { get; set; } = null!;

        [JsonPropertyName("model")]
        public string Model { get; set; } = null!;

        [JsonPropertyName("color")]
        public string Color { get; set; } = null!;

        [JsonPropertyName("registrationDate")]
        public string RegistrationDate { get; set; } = null!;

        [JsonPropertyName("owner")]
        public string Owner { get; set; } = null!;

        [JsonPropertyName("accessType")]
        public string AccessType { get; set; } = null!;

        [JsonPropertyName("status")]
        public string Status { get; set; } = null!;
    }

    public class ParkingActivityDto
    {
        [JsonPropertyName("date")]
        public string Date { get; set; } = null!;

        [JsonPropertyName("location")]
        public string Location { get; set; } = null!;

        [JsonPropertyName("vehicle")]
        public string Vehicle { get; set; } = null!;

        [JsonPropertyName("duration")]
        public string Duration { get; set; } = null!;

        [JsonPropertyName("amount")]
        public string Amount { get; set; } = null!;
    }

    public class UserStatsDto
    {
        [JsonPropertyName("totalParkingSessions")]
        public int TotalParkingSessions { get; set; }

        [JsonPropertyName("totalSpent")]
        public string TotalSpent { get; set; } = "$0.00";

        [JsonPropertyName("avgSessionDuration")]
        public string AvgSessionDuration { get; set; } = "0h";
    }
}