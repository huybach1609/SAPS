using SAPLDesktopApp.Constants;
using SAPLDesktopApp.Resources;
using System;

namespace SAPLDesktopApp.Helpers
{
    public static class StaffRoleLocalizationHelper
    {
        /// <summary>
        /// Gets the localized role text for staff role
        /// </summary>
        /// <param name="role">The role string from API or user data</param>
        /// <returns>Localized role text</returns>
        public static string GetLocalizedRole(string role)
        {
            if (string.IsNullOrWhiteSpace(role))
                return TextResource.RoleStaff;

            // Handle enum-based roles
            if (Enum.TryParse<StaffRole>(role, true, out var staffRole))
            {
                return staffRole switch
                {
                    StaffRole.Staff => TextResource.RoleStaff,
                    _ => TextResource.RoleStaff
                };
            }

            // Handle string-based roles - default to Staff
            return role.ToLowerInvariant() switch
            {
                "staff" => TextResource.RoleStaff,
                _ => TextResource.RoleStaff // Default to Staff for any unrecognized role
            };
        }

        /// <summary>
        /// Gets the StaffRole enum value from a string
        /// </summary>
        /// <param name="role">The role string</param>
        /// <returns>StaffRole enum value</returns>
        public static StaffRole GetStaffRoleEnum(string role)
        {
            if (Enum.TryParse<StaffRole>(role, true, out var staffRole))
            {
                return staffRole;
            }
            
            return StaffRole.Staff; // Default to Staff
        }
    }
}