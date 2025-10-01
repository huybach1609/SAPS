using SAPLDesktopApp.Constants;
using SAPLDesktopApp.Helpers;
using System;

namespace SAPLDesktopApp.Models
{
    public class LoggedInUser
    {
        // User information extracted from JWT claims
        public string Id { get; set; } = null!; // From ClaimTypes.NameIdentifier
        public string Email { get; set; } = null!; // From ClaimTypes.Email
        public string Phone { get; set; } = string.Empty; // From ClaimTypes.MobilePhone
        public string FullName { get; set; } = null!; // From ClaimTypes.Name
        public string Role { get; set; } = null!; // From ClaimTypes.Role
        public string? ParkingLotId { get; set; } // From "parking_lot_id" claim
        public string JwtId { get; set; } = null!; // From "jti" claim
        
        // Helper properties
        public bool IsStaff => Role.Equals("Staff", StringComparison.OrdinalIgnoreCase);
        public bool HasParkingLot => !string.IsNullOrEmpty(ParkingLotId);

        // StaffRole enum property
        public StaffRole StaffRoleEnum => StaffRoleLocalizationHelper.GetStaffRoleEnum(Role);
        
        // Localized role property for UI display
        public string LocalizedRole => StaffRoleLocalizationHelper.GetLocalizedRole(Role);
    }
}
