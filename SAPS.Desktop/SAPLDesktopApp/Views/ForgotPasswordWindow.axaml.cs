using Avalonia.ReactiveUI;
using SAPLDesktopApp.ViewModels;

namespace SAPLDesktopApp.Views
{
    public partial class ForgotPasswordWindow : ReactiveWindow<ForgotPasswordViewModel>
    {
        public ForgotPasswordWindow()
        {
            InitializeComponent();
            
            var viewModel = new ForgotPasswordViewModel();
            DataContext = viewModel;

            // Subscribe to view model events
            viewModel.BackToLoginRequested += OnBackToLoginRequested;
            viewModel.RequestCompleted += OnRequestCompleted;
        }

        private void OnBackToLoginRequested()
        {
            Close();
        }

        private void OnRequestCompleted()
        {
            Close();
        }
    }
}