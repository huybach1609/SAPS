using Avalonia;
using Avalonia.Controls;
using Avalonia.Media;
using System;
using System.Globalization;

namespace SAPLDesktopApp.Helpers
{
    /// <summary>
    /// Static helper class for retrieving application resources with type safety and fallbacks
    /// </summary>
    public static class ResourceHelper
    {
        /// <summary>
        /// Get a text resource from the application resources
        /// </summary>
        /// <param name="key">The resource key</param>
        /// <param name="fallback">Fallback value if resource not found</param>
        /// <returns>The text resource value or fallback</returns>
        public static string GetTextResource(string key, string fallback = "")
        {
            try
            {
                return Application.Current?.FindResource(key) as string ?? fallback;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ResourceHelper: Failed to get text resource '{key}': {ex.Message}");
                return fallback;
            }
        }

        /// <summary>
        /// Get a numeric resource from the application resources
        /// </summary>
        /// <param name="key">The resource key</param>
        /// <param name="fallback">Fallback value if resource not found</param>
        /// <returns>The numeric resource value or fallback</returns>
        public static double GetNumberResource(string key, double fallback = 0.0)
        {
            try
            {
                var resource = Application.Current?.FindResource(key);
                return resource switch
                {
                    double d => d,
                    int i => i,
                    float f => f,
                    decimal dec => (double)dec,
                    string s when double.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed) => parsed,
                    _ => fallback
                };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ResourceHelper: Failed to get number resource '{key}': {ex.Message}");
                return fallback;
            }
        }

        /// <summary>
        /// Get a theme resource (Brush, Color, etc.) from the application resources
        /// </summary>
        /// <typeparam name="T">The expected theme resource type</typeparam>
        /// <param name="key">The resource key</param>
        /// <param name="fallback">Fallback value if resource not found</param>
        /// <returns>The theme resource value or fallback</returns>
        public static T GetThemeResource<T>(string key, T fallback = default!) where T : class
        {
            try
            {
                var resource = Application.Current?.FindResource(key);
                return resource as T ?? fallback;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ResourceHelper: Failed to get theme resource '{key}' of type {typeof(T).Name}: {ex.Message}");
                return fallback;
            }
        }
    }
}