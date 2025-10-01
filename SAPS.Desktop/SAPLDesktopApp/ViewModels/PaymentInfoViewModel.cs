using ReactiveUI;
using SAPLDesktopApp.Dtos.PaymentDtos;
using SAPLDesktopApp.Helpers;
using SAPLDesktopApp.Resources;
using SAPLDesktopApp.Services;
using SAPLDesktopApp.Constants;
using System;
using System.Reactive;
using System.Threading.Tasks;
using System.Threading;
using Avalonia.Media.Imaging;

namespace SAPLDesktopApp.ViewModels
{
    public class PaymentInfoViewModel : ViewModelBase, IDisposable
    {
        private readonly IBankService _bankService;
        private readonly IParkingSessionService _parkingSessionService;
        private readonly string _sessionId;
        private string _bankName = "";
        private string _accountHolder = "";
        private string _accountNumber = "";
        private string _amount = "";
        private string _description = "";
        private Bitmap? _qrCodeImage;
        private string _currentPaymentStatus = "";
        
        // Timer for periodic payment status checking
        private Timer? _paymentStatusTimer;
        private const int PAYMENT_CHECK_INTERVAL_SECONDS = 15;
        private bool _isDisposed = false;

        public string BankName
        {
            get => _bankName;
            set => this.RaiseAndSetIfChanged(ref _bankName, value);
        }

        public string AccountHolder
        {
            get => _accountHolder;
            set => this.RaiseAndSetIfChanged(ref _accountHolder, value);
        }

        public string AccountNumber
        {
            get => _accountNumber;
            set => this.RaiseAndSetIfChanged(ref _accountNumber, value);
        }

        public string Amount
        {
            get => _amount;
            set => this.RaiseAndSetIfChanged(ref _amount, value);
        }

        public string Description
        {
            get => _description;
            set => this.RaiseAndSetIfChanged(ref _description, value);
        }

        public Bitmap? QrCodeImage
        {
            get => _qrCodeImage; 
            set => this.RaiseAndSetIfChanged(ref _qrCodeImage, value);
        }

        public ReactiveCommand<Unit, Unit> CloseCommand { get; }

        // Events for communicating with CameraViewModel
        public event Action? RequestClose;
        public event Action? PaymentCompleted;

        public PaymentInfoViewModel(PaymentResponseDto paymentInformation, string sessionId, IBankService bankService)
        {
            _bankService = bankService ?? throw new ArgumentNullException(nameof(bankService));
            _parkingSessionService = ServiceLocator.GetService<IParkingSessionService>();
            _sessionId = sessionId ?? throw new ArgumentNullException(nameof(sessionId));
            
            CloseCommand = ReactiveCommand.Create(Close);
            
            // Initialize with loading state
            BankName = "Loading...";
            
            // Update display data asynchronously
            _ = Task.Run(async () => await UpdateDisplayDataAsync(paymentInformation));
            
            // Start payment status monitoring timer
            StartPaymentStatusMonitoring();
        }

        private void StartPaymentStatusMonitoring()
        {
            try
            {
                _paymentStatusTimer = new Timer(
                    async _ => await CheckPaymentStatusAsync(),
                    null,
                    TimeSpan.FromSeconds(PAYMENT_CHECK_INTERVAL_SECONDS),
                    TimeSpan.FromSeconds(PAYMENT_CHECK_INTERVAL_SECONDS));
                
                System.Diagnostics.Debug.WriteLine($"PaymentInfoViewModel: Started payment status monitoring for session {_sessionId}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"PaymentInfoViewModel: Error starting payment status monitoring: {ex.Message}");
            }
        }

        private async Task CheckPaymentStatusAsync()
        {
            if (_isDisposed)
                return;

            try
            {
                System.Diagnostics.Debug.WriteLine($"PaymentInfoViewModel: Checking payment status for session {_sessionId}");
                
                // Get updated payment information
                var paymentInfo = await _parkingSessionService.GetSessionPaymentInfoAsync(_sessionId);
                
                if (paymentInfo?.Data?.Data?.Status == null)
                {
                    System.Diagnostics.Debug.WriteLine("PaymentInfoViewModel: No payment status received from API");
                    return;
                }

                var newStatus = paymentInfo.Data.Data.Status;
                
                // Check if status has changed
                if (newStatus != _currentPaymentStatus)
                {
                    System.Diagnostics.Debug.WriteLine($"PaymentInfoViewModel: Payment status changed from '{_currentPaymentStatus}' to '{newStatus}'");
                    _currentPaymentStatus = newStatus;
                    
                    await HandlePaymentStatusChange(paymentInfo.Data.Data, newStatus);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"PaymentInfoViewModel: Error checking payment status: {ex.Message}");
            }
        }

        private async Task HandlePaymentStatusChange(PaymentDataDto paymentData, string newStatus)
        {
            try
            {
                await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(async () =>
                {
                    switch (newStatus.ToUpperInvariant())
                    {
                        case nameof(PaymentStatus.PAID):
                            System.Diagnostics.Debug.WriteLine("PaymentInfoViewModel: Payment completed successfully");
                            
                            // Stop monitoring
                            StopPaymentStatusMonitoring();
                            
                            // Notify CameraViewModel that payment is complete
                            PaymentCompleted?.Invoke();
                            
                            // Close the payment window
                            RequestClose?.Invoke();
                            break;

                        case nameof(PaymentStatus.EXPIRED):
                        case nameof(PaymentStatus.UNDERPAID):
                            System.Diagnostics.Debug.WriteLine($"PaymentInfoViewModel: Payment status requires update: {newStatus}");
                            
                            // Update amount and QR code
                            await UpdatePaymentDisplayAsync(paymentData);
                            break;

                        case nameof(PaymentStatus.CANCELLED):
                        case nameof(PaymentStatus.FAILED):
                            System.Diagnostics.Debug.WriteLine($"PaymentInfoViewModel: Payment failed or cancelled: {newStatus}");
                            
                            // Could show error message or update UI accordingly
                            await UpdatePaymentDisplayAsync(paymentData);
                            break;

                        default:
                            System.Diagnostics.Debug.WriteLine($"PaymentInfoViewModel: Unhandled payment status: {newStatus}");
                            break;
                    }
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"PaymentInfoViewModel: Error handling payment status change: {ex.Message}");
            }
        }

        private async Task UpdatePaymentDisplayAsync(PaymentDataDto paymentData)
        {
            try
            {
                // Get bank name asynchronously
                var bankName = await GetBankNameAsync(paymentData.Bin);
                
                // Update UI properties
                BankName = bankName;
                AccountHolder = paymentData.AccountName ?? TextResource.NotProvidedText;
                AccountNumber = paymentData.AccountNumber ?? TextResource.NotProvidedText;
                Amount = FormatAmount(paymentData.Amount);
                Description = paymentData.Description ?? TextResource.NotProvidedText;
                QrCodeImage = GenerateQrCodeImage(paymentData.QrCode);
                
                System.Diagnostics.Debug.WriteLine("PaymentInfoViewModel: Updated payment display with new data");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"PaymentInfoViewModel: Error updating payment display: {ex.Message}");
            }
        }

        private void StopPaymentStatusMonitoring()
        {
            try
            {
                _paymentStatusTimer?.Dispose();
                _paymentStatusTimer = null;
                System.Diagnostics.Debug.WriteLine("PaymentInfoViewModel: Stopped payment status monitoring");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"PaymentInfoViewModel: Error stopping payment status monitoring: {ex.Message}");
            }
        }

        private async Task UpdateDisplayDataAsync(PaymentResponseDto paymentResponse)
        {
            try
            {
                if (paymentResponse.Data != null)
                {
                    var data = paymentResponse.Data;
                    
                    // Store initial payment status
                    _currentPaymentStatus = data.Status ?? "";
                    
                    // Get bank name asynchronously
                    var bankName = await GetBankNameAsync(data.Bin);
                    
                    // Update UI on the UI thread
                    await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
                    {
                        BankName = bankName;
                        AccountHolder = data.AccountName ?? TextResource.NotProvidedText;
                        AccountNumber = data.AccountNumber ?? TextResource.NotProvidedText;
                        Amount = FormatAmount(data.Amount);
                        Description = data.Description ?? TextResource.NotProvidedText;
                        QrCodeImage = GenerateQrCodeImage(data.QrCode);
                    });
                }
                else
                {
                    // Update UI on the UI thread for null data
                    await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
                    {
                        BankName = TextResource.NotProvidedText;
                        AccountHolder = TextResource.NotProvidedText;
                        AccountNumber = TextResource.NotProvidedText;
                        Amount = TextResource.NotProvidedText;
                        Description = TextResource.NotProvidedText;
                        QrCodeImage = null;
                    });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"PaymentInfoViewModel: Error updating display data: {ex.Message}");
                
                // Fallback to default values on error
                await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
                {
                    if (string.IsNullOrEmpty(BankName) || BankName == "Loading...")
                    {
                        BankName = TextResource.NotProvidedText;
                    }
                });
            }
        }

        private async Task<string> GetBankNameAsync(string bin)
        {
            try
            {
                if (string.IsNullOrEmpty(bin))
                    return TextResource.NotProvidedText;

                var bank = await _bankService.GetBank(bin);
                return bank?.Name ?? TextResource.NotProvidedText;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"PaymentInfoViewModel: Error getting bank name for BIN {bin}: {ex.Message}");
                return TextResource.NotProvidedText;
            }
        }

        private static string FormatAmount(int amount)
        {
            return amount.ToString("c", Resources.TextResource.Culture);
        }
        
        private static Bitmap? GenerateQrCodeImage(string qrCode)
        {
            try
            {
                if (string.IsNullOrEmpty(qrCode))
                    return null;

                var qrCodeBytes = QRCodeHelper.GenerateQRImage(qrCode);
                if (qrCodeBytes != null)
                {
                    using var ms = new System.IO.MemoryStream(qrCodeBytes);
                    return new Bitmap(ms);
                }
                return null;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"PaymentInfoViewModel: Error generating QR code image: {ex.Message}");
                return null;
            }
        }
        
        private void Close()
        {
            StopPaymentStatusMonitoring();
            RequestClose?.Invoke();
        }

        public void Dispose()
        {
            if (_isDisposed)
                return;

            _isDisposed = true;
            StopPaymentStatusMonitoring();
            System.Diagnostics.Debug.WriteLine("PaymentInfoViewModel: Disposed");
        }
    }
}