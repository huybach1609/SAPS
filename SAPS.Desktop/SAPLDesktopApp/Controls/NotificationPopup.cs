using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Media;
using ReactiveUI;
using SAPLDesktopApp.Models;
using System;

namespace SAPLDesktopApp.Controls
{
    /// <summary>
    /// Individual notification popup control
    /// </summary>
    public class NotificationPopup : ContentControl
    {
        public event EventHandler? CloseRequested;

        private readonly VehicleNotification _notification;
        private Border? _mainBorder;
        private ProgressBar? _progressBar;
        private Button? _closeButton;

        public string NotificationId => _notification.Id!;

        public NotificationPopup(VehicleNotification notification)
        {
            _notification = notification ?? throw new ArgumentNullException(nameof(notification));
            InitializeComponent();
            DataContext = _notification;

            // Subscribe to progress changes
            _notification.WhenAnyValue(x => x.ProgressValue)
                .Subscribe(progress => UpdateProgressBar(progress));
        }

        private void InitializeComponent()
        {
            // Use StaticResource values for dimensions and layout
            Width = Application.Current?.FindResource("NotificationWidth") as double? ?? 320;
            Margin = Application.Current?.FindResource("NotificationMargin") as Thickness? ?? new Thickness(16, 8);
            HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right;
            VerticalAlignment = Avalonia.Layout.VerticalAlignment.Top;

            // Main border with shadow effect using StaticResource
            _mainBorder = new Border
            {
                Background = Application.Current?.FindResource("NotificationBackgroundBrush") as IBrush ??
                           Application.Current?.FindResource("NeutralBackgroundBrush") as IBrush ?? Brushes.White,
                CornerRadius = Application.Current?.FindResource("NotificationCornerRadius") as CornerRadius? ??
                             Application.Current?.FindResource("CornerRadiusLarge") as CornerRadius? ?? new CornerRadius(8),
                BorderBrush = new SolidColorBrush(Color.Parse(_notification.BackgroundColor)),
                BorderThickness = Application.Current?.FindResource("NotificationBorderThickness") as Thickness? ?? new Thickness(0, 0, 4, 0),
                BoxShadow = new BoxShadows(BoxShadow.Parse("0 4 16 0 #40000000")),
                Padding = Application.Current?.FindResource("NotificationPadding") as Thickness? ??
                         Application.Current?.FindResource("PaddingLarge") as Thickness? ?? new Thickness(16)
            };

            // Content grid
            var contentGrid = new Grid();
            contentGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            contentGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            contentGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            contentGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));

            // Icon with StaticResource sizes
            var iconSize = Application.Current?.FindResource("NotificationIconSize") as double? ??
                          Application.Current?.FindResource("IconSizeXXLarge") as double? ?? 32;

            var iconBorder = new Border
            {
                Width = iconSize,
                Height = iconSize,
                CornerRadius = Application.Current?.FindResource("NotificationIconCornerRadius") as CornerRadius? ?? new CornerRadius(16),
                Background = new SolidColorBrush(Color.Parse(_notification.BackgroundColor)),
                VerticalAlignment = Avalonia.Layout.VerticalAlignment.Top,
                Margin = Application.Current?.FindResource("NotificationIconMargin") as Thickness? ??
                        Application.Current?.FindResource("MarginIcon") as Thickness? ?? new Thickness(0, 0, 12, 0)
            };

            var iconPath = new Avalonia.Controls.Shapes.Path
            {
                Data = Geometry.Parse(_notification.IconPath),
                Fill = Application.Current?.FindResource("TextLightBrush") as IBrush ?? Brushes.White,
                Width = Application.Current?.FindResource("IconSizeMedium") as double? ?? 16,
                Height = Application.Current?.FindResource("IconSizeMedium") as double? ?? 16,
                Stretch = Stretch.Uniform,
                HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Center,
                VerticalAlignment = Avalonia.Layout.VerticalAlignment.Center
            };

            iconBorder.Child = iconPath;
            Grid.SetRow(iconBorder, 0);
            Grid.SetColumn(iconBorder, 0);
            Grid.SetRowSpan(iconBorder, 2);
            contentGrid.Children.Add(iconBorder);

            // Title using StaticResource font sizes and colors
            var titleBlock = new TextBlock
            {
                Text = _notification.Title,
                FontWeight = FontWeight.SemiBold,
                FontSize = Application.Current?.FindResource("FontSizeMedium") as double? ?? 14,
                Foreground = Application.Current?.FindResource("TextPrimaryBrush") as IBrush ?? Brushes.Black,
                TextWrapping = TextWrapping.Wrap
            };
            Grid.SetRow(titleBlock, 0);
            Grid.SetColumn(titleBlock, 1);
            contentGrid.Children.Add(titleBlock);

            // Close button using StaticResource values
            _closeButton = new Button
            {
                Content = Application.Current?.FindResource("IconClose") as string ?? "✕",
                Background = Application.Current?.FindResource("TransparentBrush") as IBrush ?? Brushes.Transparent,
                Foreground = Application.Current?.FindResource("TextMutedBrush") as IBrush ?? Brushes.Gray,
                FontSize = Application.Current?.FindResource("FontSizeSmall") as double? ?? 12,
                Padding = Application.Current?.FindResource("PaddingSmall") as Thickness? ?? new Thickness(4),
                BorderThickness = Application.Current?.FindResource("BorderThicknessNone") as Thickness? ?? new Thickness(0),
                HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right,
                VerticalAlignment = Avalonia.Layout.VerticalAlignment.Top
            };
            _closeButton.Click += OnCloseButtonClick;
            Grid.SetRow(_closeButton, 0);
            Grid.SetColumn(_closeButton, 2);
            contentGrid.Children.Add(_closeButton);

            // Message using StaticResource font sizes and colors
            var messageBlock = new TextBlock
            {
                Text = _notification.Message,
                FontSize = Application.Current?.FindResource("FontSizeRegular") as double? ?? 12,
                Foreground = Application.Current?.FindResource("TextSecondaryBrush") as IBrush ?? Brushes.Gray,
                TextWrapping = TextWrapping.Wrap,
                Margin = Application.Current?.FindResource("MarginSmall") as Thickness? ?? new Thickness(0, 4, 0, 0)
            };
            Grid.SetRow(messageBlock, 1);
            Grid.SetColumn(messageBlock, 1);
            Grid.SetColumnSpan(messageBlock, 2);
            contentGrid.Children.Add(messageBlock);

            // License plate (if available) using StaticResource values
            if (!string.IsNullOrEmpty(_notification.LicensePlate))
            {
                var licensePlateBlock = new TextBlock
                {
                    Text = _notification.LicensePlate,
                    FontSize = Application.Current?.FindResource("FontSizeSmall") as double? ?? 11,
                    FontWeight = FontWeight.Bold,
                    Foreground = new SolidColorBrush(Color.Parse(_notification.BackgroundColor)),
                    Margin = Application.Current?.FindResource("MarginSmall") as Thickness? ?? new Thickness(0, 6, 0, 0)
                };
                Grid.SetRow(licensePlateBlock, 2);
                Grid.SetColumn(licensePlateBlock, 1);
                Grid.SetColumnSpan(licensePlateBlock, 2);
                contentGrid.Children.Add(licensePlateBlock);
            }

            // Progress bar using StaticResource values
            _progressBar = new ProgressBar
            {
                Minimum = 0,
                Maximum = 100,
                Value = _notification.ProgressValue,
                Height = Application.Current?.FindResource("NotificationProgressHeight") as double? ?? 3,
                Margin = Application.Current?.FindResource("NotificationProgressMargin") as Thickness? ??
                        Application.Current?.FindResource("MarginMedium") as Thickness? ?? new Thickness(0, 8, 0, 0),
                Background = Application.Current?.FindResource("NotificationProgressBackgroundBrush") as IBrush ??
                           Application.Current?.FindResource("NeutralBorderBrush") as IBrush ?? Brushes.LightGray,
                Foreground = new SolidColorBrush(Color.Parse(_notification.BackgroundColor))
            };
            Grid.SetRow(_progressBar, 3);
            Grid.SetColumn(_progressBar, 0);
            Grid.SetColumnSpan(_progressBar, 3);
            contentGrid.Children.Add(_progressBar);

            _mainBorder.Child = contentGrid;
            Content = _mainBorder;
        }

        private void UpdateProgressBar(double progress)
        {
            if (_progressBar != null)
            {
                _progressBar.Value = progress;
            }
        }

        private void OnCloseButtonClick(object? sender, RoutedEventArgs e)
        {
            CloseRequested?.Invoke(this, EventArgs.Empty);
        }
    }
}