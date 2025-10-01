using SAPLDesktopApp.Resources;
using System;

namespace SAPLDesktopApp.Helpers
{
    public static class IncidentReportLocalizationHelper
    {
        /// <summary>
        /// Gets the localized status text for incident report status
        /// </summary>
        /// <param name="status">The status string from API</param>
        /// <returns>Localized status text</returns>
        public static string GetLocalizedStatus(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                return TextResource.UnknownText;

            return status.ToLowerInvariant() switch
            {
                "open" => TextResource.StatusOpen,
                "inprogress" => TextResource.StatusInProgress,
                "resolved" => TextResource.StatusResolved,
                "close" => TextResource.StatusClosed,
                _ => status // Return original if no match found
            };
        }

        /// <summary>
        /// Gets the localized priority text for incident report priority
        /// </summary>
        /// <param name="priority">The priority string from API</param>
        /// <returns>Localized priority text</returns>
        public static string GetLocalizedPriority(string priority)
        {
            if (string.IsNullOrWhiteSpace(priority))
                return TextResource.UnknownText;

            return priority.ToLowerInvariant() switch
            {
                "low" => TextResource.PriorityLow,
                "medium" => TextResource.PriorityMedium,
                "high" => TextResource.PriorityHigh,
                "critical" => TextResource.PriorityCritical,
                _ => priority // Return original if no match found
            };
        }

        /// <summary>
        /// Gets all available priority options for UI dropdowns
        /// </summary>
        /// <returns>Array of localized priority options</returns>
        public static string[] GetPriorityOptions()
        {
            return new[]
            {
                TextResource.PriorityLow,
                TextResource.PriorityMedium,
                TextResource.PriorityHigh,
                TextResource.PriorityCritical
            };
        }

        /// <summary>
        /// Gets all available status options for UI dropdowns
        /// </summary>
        /// <returns>Array of localized status options</returns>
        public static string[] GetStatusOptions()
        {
            return new[]
            {
                TextResource.StatusOpen,
                TextResource.StatusInProgress,
                TextResource.StatusResolved,
                TextResource.StatusClosed
            };
        }

        /// <summary>
        /// Gets the API value for a localized priority (reverse mapping)
        /// </summary>
        /// <param name="localizedPriority">The localized priority text</param>
        /// <returns>API priority value</returns>
        public static string GetApiPriorityValue(string localizedPriority)
        {
            if (string.IsNullOrWhiteSpace(localizedPriority))
                return "Low";

            if (localizedPriority == TextResource.PriorityLow) return "Low";
            if (localizedPriority == TextResource.PriorityMedium) return "Medium";
            if (localizedPriority == TextResource.PriorityHigh) return "High";
            if (localizedPriority == TextResource.PriorityCritical) return "Critical";

            return localizedPriority; // Return as-is if no match
        }

        /// <summary>
        /// Gets the API value for a localized status (reverse mapping)
        /// </summary>
        /// <param name="localizedStatus">The localized status text</param>
        /// <returns>API status value</returns>
        public static string GetApiStatusValue(string localizedStatus)
        {
            if (string.IsNullOrWhiteSpace(localizedStatus))
                return "Open";

            if (localizedStatus == TextResource.StatusOpen) return "Open";
            if (localizedStatus == TextResource.StatusInProgress) return "InProgress";
            if (localizedStatus == TextResource.StatusResolved) return "Resolved";
            if (localizedStatus == TextResource.StatusClosed) return "Close";

            return localizedStatus; // Return as-is if no match
        }
    }
}