using Avalonia.Controls;
using SAPLDesktopApp.Resources;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public class DialogService : IDialogService
    {
        public async Task<bool> ShowConfirmationAsync(string title, string message, string? yesButtonText = null, string? noButtonText = null)
        {
            var dialog = new Window
            {
                Title = title,
                Width = 400,
                Height = 200,
                WindowStartupLocation = WindowStartupLocation.CenterOwner,
                CanResize = false,
                ShowInTaskbar = false
            };

            var result = false;

            var content = new StackPanel
            {
                Margin = new Avalonia.Thickness(20),
                Spacing = 20
            };

            // Message text
            var messageText = new TextBlock
            {
                Text = message,
                TextWrapping = Avalonia.Media.TextWrapping.Wrap,
                FontSize = 14
            };
            content.Children.Add(messageText);

            // Buttons panel
            var buttonsPanel = new StackPanel
            {
                Orientation = Avalonia.Layout.Orientation.Horizontal,
                HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right,
                Spacing = 10
            };

            var yesButton = new Button
            {
                Content = yesButtonText ?? TextResource.BtnYes,
                Width = 80,
                IsDefault = true
            };
            yesButton.Click += (s, e) =>
            {
                result = true;
                dialog.Close();
            };

            var noButton = new Button
            {
                Content = noButtonText ?? TextResource.BtnNo,
                Width = 80,
                IsCancel = true
            };
            noButton.Click += (s, e) =>
            {
                result = false;
                dialog.Close();
            };

            buttonsPanel.Children.Add(yesButton);
            buttonsPanel.Children.Add(noButton);
            content.Children.Add(buttonsPanel);

            dialog.Content = content;

            // Get current window as owner
            if (Avalonia.Application.Current?.ApplicationLifetime is Avalonia.Controls.ApplicationLifetimes.IClassicDesktopStyleApplicationLifetime desktop)
            {
                await dialog.ShowDialog(desktop.MainWindow!);
            }

            return result;
        }

        public async Task ShowInfoAsync(string title, string message, string? buttonText = null)
        {
            var dialog = new Window
            {
                Title = title,
                Width = 350,
                Height = 150,
                WindowStartupLocation = WindowStartupLocation.CenterOwner,
                CanResize = false,
                ShowInTaskbar = false
            };

            var content = new StackPanel
            {
                Margin = new Avalonia.Thickness(20),
                Spacing = 20
            };

            var messageText = new TextBlock
            {
                Text = message,
                TextWrapping = Avalonia.Media.TextWrapping.Wrap,
                FontSize = 14
            };
            content.Children.Add(messageText);

            var buttonPanel = new StackPanel
            {
                HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right
            };

            var okButton = new Button
            {
                Content = buttonText ?? TextResource.BtnOK,
                Width = 80,
                IsDefault = true
            };
            okButton.Click += (s, e) => dialog.Close();

            buttonPanel.Children.Add(okButton);
            content.Children.Add(buttonPanel);

            dialog.Content = content;

            if (Avalonia.Application.Current?.ApplicationLifetime is Avalonia.Controls.ApplicationLifetimes.IClassicDesktopStyleApplicationLifetime desktop)
            {
                await dialog.ShowDialog(desktop.MainWindow!);
            }
        }

        public async Task ShowErrorAsync(string title, string message, string? buttonText = null)
        {
            await ShowInfoAsync(title, message, buttonText);
        }
    }
}