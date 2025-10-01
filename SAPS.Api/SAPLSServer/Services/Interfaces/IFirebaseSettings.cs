namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Configuration settings for Firebase Cloud Messaging
    /// </summary>
    public interface IFirebaseSettings
    {
        /// <summary>
        /// Firebase project ID
        /// </summary>
        string ProjectId { get; }

        /// <summary>
        /// Path to Firebase service account key file
        /// </summary>
        string ServiceAccountJson { get; }

        /// <summary>
        /// Default notification sound
        /// </summary>
        string DefaultSound { get; }

        /// <summary>
        /// Default notification icon
        /// </summary>
        string DefaultIcon { get; }
    }
}