using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Avalonia.ReactiveUI;
using ReactiveUI;
using SAPLDesktopApp.ViewModels;
using System;

namespace SAPLDesktopApp.Views;

public partial class PaymentInfoWindow : ReactiveWindow<PaymentInfoViewModel>
{
    public PaymentInfoWindow()
    {
        InitializeComponent();
        this.WhenActivated(disposables =>
        {
            // Subscribe to the CloseRequested event to close window
            if (ViewModel != null)
            {
                ViewModel.RequestClose += OnRequestClose;
            }
        });
    }
    private void OnRequestClose()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("PaymentInfoWindow: Close requested by ViewModel");
            Close();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"PaymentInfoWindow: Error closing window: {ex.Message}");
        }
    }
}