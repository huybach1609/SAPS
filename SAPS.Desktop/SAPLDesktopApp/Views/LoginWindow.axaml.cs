using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Avalonia.ReactiveUI;
using ReactiveUI;
using SAPLDesktopApp.ViewModels;
using System;

namespace SAPLDesktopApp.Views
{
    public partial class LoginWindow : ReactiveWindow<LoginViewModel>
    {
        public LoginWindow()
        {
            InitializeComponent();
            
            this.WhenActivated(disposables =>
            {
                // Subscribe to the IsLoginSuccessful property to close window on successful login
                if (ViewModel != null)
                {
                    ViewModel.WhenAnyValue(x => x.IsLoginSuccessful)
                        .Subscribe(isSuccess =>
                        {
                            if (isSuccess)
                            {
                                // Close the login window after successful login
                                Close();
                            }
                        });
                }
            });
        }
    }
}