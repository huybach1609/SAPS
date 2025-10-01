namespace SAPLDesktopApp.Models
{
    public class LanguageOption
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string NativeName { get; set; } = null!;
        public bool IsSelected { get; set; }
    }

    public class PasswordChangeModel
    {
        public string CurrentPassword { get; set; } = "";
        public string NewPassword { get; set; } = "";
        public string ConfirmPassword { get; set; } = "";
    }

    public class UserSettings
    {
        public string LanguageCode { get; set; } = "en";
        public bool NotificationsEnabled { get; set; } = true;
        public bool AutoSaveEnabled { get; set; } = true;
        public bool RememberCredentials { get; set; } = false;
        public AuthCredentials? SavedCredentials { get; set; }
    }

    /// <summary>
    /// Stored authentication credentials for "Remember Me" functionality
    /// </summary>
    public class AuthCredentials
    {
        public string Email { get; set; } = string.Empty;
        
        // Storing password is a security risk - in production, consider more secure alternatives
        // such as using Windows Credential Manager or encrypted storage
        public string EncryptedPassword { get; set; } = string.Empty;
    }
}