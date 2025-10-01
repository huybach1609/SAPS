using Avalonia.Markup.Xaml;
using Avalonia.ReactiveUI;
using ReactiveUI;
using SAPLDesktopApp.ViewModels;

namespace SAPLDesktopApp.Views;

public partial class CameraView : ReactiveUserControl<CameraViewModel>
{
    public CameraView()
    {
        AvaloniaXamlLoader.Load(this);
    }
}