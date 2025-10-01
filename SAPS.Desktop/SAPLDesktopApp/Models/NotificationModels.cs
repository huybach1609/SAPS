using ReactiveUI;
using System;

namespace SAPLDesktopApp.Models
{
    public enum NotificationType
    {
        CheckIn,
        CheckOut,
        Info,
        Warning,
        Error
    }

    public class VehicleNotification : ReactiveObject
    {
        private string? _id;
        private string? _title;
        private string? _message;
        private string? _licensePlate;
        private NotificationType _type;
        private DateTime _timestamp;
        private double _progressValue;
        private bool _isVisible;
        private TimeSpan _autoCloseTime;

        public VehicleNotification()
        {
            _id = Guid.NewGuid().ToString();
            _timestamp = DateTime.Now;
            _isVisible = true;
            _autoCloseTime = TimeSpan.FromSeconds(5); // Default 5 seconds
            _progressValue = 100;
        }

        public string? Id
        {
            get => _id;
            set => this.RaiseAndSetIfChanged(ref _id, value);
        }

        public string? Title
        {
            get => _title;
            set => this.RaiseAndSetIfChanged(ref _title, value);
        }

        public string? Message
        {
            get => _message;
            set => this.RaiseAndSetIfChanged(ref _message, value);
        }

        public string? LicensePlate
        {
            get => _licensePlate;
            set => this.RaiseAndSetIfChanged(ref _licensePlate, value);
        }

        public NotificationType Type
        {
            get => _type;
            set => this.RaiseAndSetIfChanged(ref _type, value);
        }

        public DateTime Timestamp
        {
            get => _timestamp;
            set => this.RaiseAndSetIfChanged(ref _timestamp, value);
        }

        public double ProgressValue
        {
            get => _progressValue;
            set => this.RaiseAndSetIfChanged(ref _progressValue, value);
        }

        public bool IsVisible
        {
            get => _isVisible;
            set => this.RaiseAndSetIfChanged(ref _isVisible, value);
        }

        public TimeSpan AutoCloseTime
        {
            get => _autoCloseTime;
            set => this.RaiseAndSetIfChanged(ref _autoCloseTime, value);
        }

        public string TimeAgo
        {
            get
            {
                var timeSpan = DateTime.UtcNow - Timestamp;
                if (timeSpan.TotalMinutes < 1)
                    return "Just now";
                if (timeSpan.TotalMinutes < 60)
                    return $"{(int)timeSpan.TotalMinutes}m ago";
                if (timeSpan.TotalHours < 24)
                    return $"{(int)timeSpan.TotalHours}h ago";
                return Timestamp.ToString("MM/dd HH:mm");
            }
        }

        public string BackgroundColor => Type switch
        {
            NotificationType.CheckIn => "#4CAF50",
            NotificationType.CheckOut => "#F44336",
            NotificationType.Info => "#2196F3",
            NotificationType.Warning => "#FF9800",
            NotificationType.Error => "#F44336",
            _ => "#2196F3"
        };

        public string IconPath => Type switch
        {
            NotificationType.CheckIn => "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z",
            NotificationType.CheckOut => "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z",
            NotificationType.Info => "M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
            NotificationType.Warning => "M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z",
            NotificationType.Error => "M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z",
            _ => "M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
        };
    }
}