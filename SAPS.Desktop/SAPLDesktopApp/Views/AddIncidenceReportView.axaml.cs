using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Avalonia.Platform.Storage;
using Avalonia.ReactiveUI;
using Avalonia.VisualTree;
using ReactiveUI;
using SAPLDesktopApp.ViewModels;
using System.Linq;
using System.Reactive;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Views;

public partial class AddIncidenceReportView : ReactiveUserControl<AddIncidenceReportViewModel>
{
    public AddIncidenceReportView()
    {
        AvaloniaXamlLoader.Load(this);
        this.WhenActivated(d =>
        {
            if(ViewModel is null)
                return;
            d(ViewModel!.ShowFilePicker.RegisterHandler(interaction => DoShowFilePickerAsync(interaction)));
        });
    }
    private async Task DoShowFilePickerAsync(IInteractionContext<Unit, IStorageFile[]?> interaction)
    {
        // Try to get the window
        var topLevel = TopLevel.GetTopLevel(this);
        if(topLevel is null)
        {
            interaction.SetOutput(null);
            return;
        }
        var results = await topLevel.StorageProvider.OpenFilePickerAsync(
            new()
            {
                Title = "Select Files",
                AllowMultiple = true,
                FileTypeFilter = new[]
                {
                    FilePickerFileTypes.All,
                    FilePickerFileTypes.ImageAll,
                    FilePickerFileTypes.Pdf,
                    FilePickerFileTypes.TextPlain,
                }
            }
        );
        interaction.SetOutput(results.ToArray());
    }
}