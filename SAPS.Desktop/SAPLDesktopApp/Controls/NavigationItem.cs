using ReactiveUI;
using System.Reactive;

namespace SAPLDesktopApp.Controls
{
    public class NavigationItem : ReactiveObject
    {
        private bool _isSelected;

        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsEnabled { get; set; } = true;
        public bool IsVisible { get; set; } = true;

        public bool IsSelected
        {
            get => _isSelected;
            set => this.RaiseAndSetIfChanged(ref _isSelected, value);
        }

        public ReactiveCommand<NavigationItem, Unit>? NavigateCommand { get; set; }
    }
}

