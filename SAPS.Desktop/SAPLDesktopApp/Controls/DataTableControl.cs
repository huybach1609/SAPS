using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Controls.Templates;
using Avalonia.Data;
using System.Collections.ObjectModel;
using System;
using System.Windows.Input;
using ReactiveUI;
using Avalonia.Input;
using SAPLDesktopApp.Resources;

namespace SAPLDesktopApp.Controls
{
    public class DataTableControl : TemplatedControl
    {
        private Grid? _headerGrid;
        private ItemsControl? _itemsControl;
        private ComboBox? _statusFilterCombo;
        private bool _isTemplateApplied = false;

        public static readonly StyledProperty<IEnumerable> ItemsSourceProperty =
            AvaloniaProperty.Register<DataTableControl, IEnumerable>(nameof(ItemsSource));

        public static readonly StyledProperty<ObservableCollection<DataTableColumn>?> ColumnsProperty =
            AvaloniaProperty.Register<DataTableControl, ObservableCollection<DataTableColumn>?>(nameof(Columns));

        public static readonly StyledProperty<string> HeaderTextProperty =
            AvaloniaProperty.Register<DataTableControl, string>(nameof(HeaderText), "Data Table");

        public static readonly StyledProperty<string> DescriptionTextProperty =
            AvaloniaProperty.Register<DataTableControl, string>(nameof(DescriptionText), "");

        public static readonly StyledProperty<string> SearchTextProperty =
            AvaloniaProperty.Register<DataTableControl, string>(nameof(SearchText), "");

        public static readonly StyledProperty<string> SearchWatermarkProperty =
            AvaloniaProperty.Register<DataTableControl, string>(nameof(SearchWatermark));

        public static readonly StyledProperty<string> ResultSummaryProperty =
            AvaloniaProperty.Register<DataTableControl, string>(nameof(ResultSummary), "");

        public new static readonly StyledProperty<double> MaxHeightProperty =
            AvaloniaProperty.Register<DataTableControl, double>(nameof(MaxHeight), 400);

        // Filter Properties
        public static readonly StyledProperty<bool> ShowFilterProperty =
            AvaloniaProperty.Register<DataTableControl, bool>(nameof(ShowFilter), false);

        public static readonly StyledProperty<string> SelectedFilterProperty =
            AvaloniaProperty.Register<DataTableControl, string>(nameof(SelectedFilter));

        public static readonly StyledProperty<ObservableCollection<string>?> FilterOptionsProperty =
            AvaloniaProperty.Register<DataTableControl, ObservableCollection<string>?>(nameof(FilterOptions));

        public static readonly StyledProperty<string> FilterLabelProperty =
            AvaloniaProperty.Register<DataTableControl, string>(nameof(FilterLabel));

        public static readonly StyledProperty<string> FilterPropertyNameProperty =
            AvaloniaProperty.Register<DataTableControl, string>(nameof(FilterPropertyName), "Status");

        // Pagination Properties
        public static readonly StyledProperty<int> PageSizeProperty =
            AvaloniaProperty.Register<DataTableControl, int>(nameof(PageSize), 10);

        public static readonly StyledProperty<int> CurrentPageProperty =
            AvaloniaProperty.Register<DataTableControl, int>(nameof(CurrentPage), 1);

        public static readonly StyledProperty<int> TotalPagesProperty =
            AvaloniaProperty.Register<DataTableControl, int>(nameof(TotalPages), 1);

        public static readonly StyledProperty<bool> ShowPaginationProperty =
            AvaloniaProperty.Register<DataTableControl, bool>(nameof(ShowPagination), true);

        public static readonly StyledProperty<string> PaginationInfoProperty =
            AvaloniaProperty.Register<DataTableControl, string>(nameof(PaginationInfo), "");

        public static readonly StyledProperty<string> PaginationTextProperty =
            AvaloniaProperty.Register<DataTableControl, string>(nameof(PaginationText));

        public static readonly StyledProperty<bool> ShowNavigationButtonsProperty =
            AvaloniaProperty.Register<DataTableControl, bool>(nameof(ShowNavigationButtons), false);

        // Action Buttons Properties
        public static readonly StyledProperty<string> PrimaryActionTextProperty =
            AvaloniaProperty.Register<DataTableControl, string>(nameof(PrimaryActionText), "");

        public static readonly StyledProperty<bool> ShowPrimaryActionProperty =
            AvaloniaProperty.Register<DataTableControl, bool>(nameof(ShowPrimaryAction), false);

        // Command Properties
        public static readonly DirectProperty<DataTableControl, ICommand?> RefreshCommandProperty =
            AvaloniaProperty.RegisterDirect<DataTableControl, ICommand?>(
                nameof(RefreshCommand),
                o => o.RefreshCommand,
                (o, v) => o.RefreshCommand = v);

        public static readonly DirectProperty<DataTableControl, ICommand?> RowClickCommandProperty =
            AvaloniaProperty.RegisterDirect<DataTableControl, ICommand?>(
                nameof(RowClickCommand),
                o => o.RowClickCommand,
                (o, v) => o.RowClickCommand = v);

        public static readonly DirectProperty<DataTableControl, ICommand?> PrimaryActionCommandProperty =
            AvaloniaProperty.RegisterDirect<DataTableControl, ICommand?>(
                nameof(PrimaryActionCommand),
                o => o.PrimaryActionCommand,
                (o, v) => o.PrimaryActionCommand = v);

        // Filter Changed Command
        public static readonly DirectProperty<DataTableControl, ICommand?> FilterChangedCommandProperty =
            AvaloniaProperty.RegisterDirect<DataTableControl, ICommand?>(
                nameof(FilterChangedCommand),
                o => o.FilterChangedCommand,
                (o, v) => o.FilterChangedCommand = v);

        private ICommand? _refreshCommand;
        private ICommand? _rowClickCommand;
        private ICommand? _primaryActionCommand;
        private ICommand? _filterChangedCommand;

        public ICommand? RefreshCommand
        {
            get => _refreshCommand;
            set => SetAndRaise(RefreshCommandProperty, ref _refreshCommand, value);
        }

        public ICommand? RowClickCommand
        {
            get => _rowClickCommand;
            set => SetAndRaise(RowClickCommandProperty, ref _rowClickCommand, value);
        }

        public ICommand? PrimaryActionCommand
        {
            get => _primaryActionCommand;
            set => SetAndRaise(PrimaryActionCommandProperty, ref _primaryActionCommand, value);
        }

        public ICommand? FilterChangedCommand
        {
            get => _filterChangedCommand;
            set => SetAndRaise(FilterChangedCommandProperty, ref _filterChangedCommand, value);
        }

        static DataTableControl()
        {
            ItemsSourceProperty.Changed.AddClassHandler<DataTableControl>((x, e) => x.OnItemsSourceChanged());
            ColumnsProperty.Changed.AddClassHandler<DataTableControl>((x, e) => x.OnColumnsChanged());
            PageSizeProperty.Changed.AddClassHandler<DataTableControl>((x, e) => x.OnPaginationChanged());
            CurrentPageProperty.Changed.AddClassHandler<DataTableControl>((x, e) => x.OnPaginationChanged());
            SearchTextProperty.Changed.AddClassHandler<DataTableControl>((x, e) => x.OnSearchTextChanged());
            SelectedFilterProperty.Changed.AddClassHandler<DataTableControl>((x, e) => x.OnFilterChanged());
            FilterOptionsProperty.Changed.AddClassHandler<DataTableControl>((x, e) => x.OnFilterOptionsChanged());
        }

        public DataTableControl()
        {
            // Initialize default values with localized text
            SetValue(SearchWatermarkProperty, TextResource.DataTableSearchPlaceholder);
            SetValue(SelectedFilterProperty, TextResource.DataTableAllFilter);
            SetValue(FilterLabelProperty, TextResource.FilterStatusLabel);
            SetValue(PaginationTextProperty, TextResource.PaginationSinglePage);
        }

        // Properties
        public IEnumerable ItemsSource
        {
            get => GetValue(ItemsSourceProperty);
            set => SetValue(ItemsSourceProperty, value);
        }

        public ObservableCollection<DataTableColumn> Columns
        {
            get
            {
                var value = GetValue(ColumnsProperty);
                if (value == null)
                {
                    value = new ObservableCollection<DataTableColumn>();
                    SetValue(ColumnsProperty, value);
                }
                return value;
            }
            set => SetValue(ColumnsProperty, value);
        }

        public string HeaderText
        {
            get => GetValue(HeaderTextProperty);
            set => SetValue(HeaderTextProperty, value);
        }

        public string DescriptionText
        {
            get => GetValue(DescriptionTextProperty);
            set => SetValue(DescriptionTextProperty, value);
        }

        public string SearchText
        {
            get => GetValue(SearchTextProperty);
            set => SetValue(SearchTextProperty, value);
        }

        public string SearchWatermark
        {
            get => GetValue(SearchWatermarkProperty);
            set => SetValue(SearchWatermarkProperty, value);
        }

        public string ResultSummary
        {
            get => GetValue(ResultSummaryProperty);
            set => SetValue(ResultSummaryProperty, value);
        }

        public new double MaxHeight
        {
            get => GetValue(MaxHeightProperty);
            set => SetValue(MaxHeightProperty, value);
        }

        // Filter Properties
        public bool ShowFilter
        {
            get => GetValue(ShowFilterProperty);
            set => SetValue(ShowFilterProperty, value);
        }

        public string SelectedFilter
        {
            get => GetValue(SelectedFilterProperty);
            set => SetValue(SelectedFilterProperty, value);
        }

        public ObservableCollection<string> FilterOptions
        {
            get
            {
                var value = GetValue(FilterOptionsProperty);
                if (value == null)
                {
                    value = new ObservableCollection<string> { TextResource.DataTableAllFilter };
                    SetValue(FilterOptionsProperty, value);
                }
                return value;
            }
            set => SetValue(FilterOptionsProperty, value);
        }

        public string FilterLabel
        {
            get => GetValue(FilterLabelProperty);
            set => SetValue(FilterLabelProperty, value);
        }

        public string FilterPropertyName
        {
            get => GetValue(FilterPropertyNameProperty);
            set => SetValue(FilterPropertyNameProperty, value);
        }

        // Pagination Properties
        public int PageSize
        {
            get => GetValue(PageSizeProperty);
            set => SetValue(PageSizeProperty, value);
        }

        public int CurrentPage
        {
            get => GetValue(CurrentPageProperty);
            set => SetValue(CurrentPageProperty, value);
        }

        public int TotalPages
        {
            get => GetValue(TotalPagesProperty);
            set => SetValue(TotalPagesProperty, value);
        }

        public bool ShowPagination
        {
            get => GetValue(ShowPaginationProperty);
            set => SetValue(ShowPaginationProperty, value);
        }

        public string PaginationInfo
        {
            get => GetValue(PaginationInfoProperty);
            set => SetValue(PaginationInfoProperty, value);
        }

        public string PaginationText
        {
            get => GetValue(PaginationTextProperty);
            set => SetValue(PaginationTextProperty, value);
        }

        public bool ShowNavigationButtons
        {
            get => GetValue(ShowNavigationButtonsProperty);
            set => SetValue(ShowNavigationButtonsProperty, value);
        }

        // Action Properties
        public string PrimaryActionText
        {
            get => GetValue(PrimaryActionTextProperty);
            set => SetValue(PrimaryActionTextProperty, value);
        }

        public bool ShowPrimaryAction
        {
            get => GetValue(ShowPrimaryActionProperty);
            set => SetValue(ShowPrimaryActionProperty, value);
        }

        protected override void OnApplyTemplate(TemplateAppliedEventArgs e)
        {
            base.OnApplyTemplate(e);

            _headerGrid = e.NameScope.Find<Grid>("PART_HeaderGrid");
            _itemsControl = e.NameScope.Find<ItemsControl>("PART_ItemsControl");
            _statusFilterCombo = e.NameScope.Find<ComboBox>("PART_StatusFilterCombo");

            _isTemplateApplied = true;

            // Wire up pagination button events
            WirePaginationButtons(e.NameScope);

            // Wire up action button events
            WireActionButtons(e.NameScope);

            // Wire up filter events
            WireFilterEvents();

            RefreshAll();
        }

        private void WireFilterEvents()
        {
            if (_statusFilterCombo != null)
            {
                _statusFilterCombo.SelectionChanged += (sender, e) =>
                {
                    if (_statusFilterCombo.SelectedItem is string selectedValue)
                    {
                        SelectedFilter = selectedValue;
                        OnFilterChanged();
                    }
                };
            }
        }

        private void OnFilterChanged()
        {
            // Reset to first page when filter changes
            CurrentPage = 1;

            // Execute filter changed command if provided
            if (FilterChangedCommand?.CanExecute(SelectedFilter) == true)
            {
                FilterChangedCommand.Execute(SelectedFilter);
            }

            RefreshData();
        }

        private void OnFilterOptionsChanged()
        {
            if (_statusFilterCombo != null && FilterOptions != null)
            {
                _statusFilterCombo.ItemsSource = FilterOptions;
                _statusFilterCombo.SelectedItem = SelectedFilter;
            }
        }

        private void WirePaginationButtons(INameScope nameScope)
        {
            var firstPageButton = nameScope.Find<Button>("PART_FirstPageButton");
            var previousPageButton = nameScope.Find<Button>("PART_PreviousPageButton");
            var nextPageButton = nameScope.Find<Button>("PART_NextPageButton");
            var lastPageButton = nameScope.Find<Button>("PART_LastPageButton");

            if (firstPageButton != null)
            {
                firstPageButton.Command = ReactiveCommand.Create(() => GoToFirstPage());
            }
            if (previousPageButton != null)
            {
                previousPageButton.Command = ReactiveCommand.Create(() => GoToPreviousPage());
            }
            if (nextPageButton != null)
            {
                nextPageButton.Command = ReactiveCommand.Create(() => GoToNextPage());
            }
            if (lastPageButton != null)
            {
                lastPageButton.Command = ReactiveCommand.Create(() => GoToLastPage());
            }
        }

        private void WireActionButtons(INameScope nameScope)
        {
            var primaryActionButton = nameScope.Find<Button>("PART_PrimaryActionButton");
            if (primaryActionButton != null)
            {
                primaryActionButton.Command = PrimaryActionCommand;
            }

            // Wire up clear filter button
            var clearFilterButton = nameScope.Find<Button>("PART_ClearFilterButton");
            if (clearFilterButton != null)
            {
                clearFilterButton.Command = ReactiveCommand.Create(() => ClearFilter());
            }
        }

        private void ClearFilter()
        {
            SelectedFilter = TextResource.DataTableAllFilter;
            CurrentPage = 1;

            if (FilterChangedCommand?.CanExecute(TextResource.DataTableAllFilter) == true)
            {
                FilterChangedCommand.Execute(TextResource.DataTableAllFilter);
            }

            RefreshData();
        }

        public void RefreshAll()
        {
            if (!_isTemplateApplied) return;
            UpdatePagination();
            BuildHeaders();
            BuildRows();
            UpdateFilterComboBox();
        }

        public void RefreshData()
        {
            if (!_isTemplateApplied) return;
            UpdatePagination();
            BuildRows();
        }

        private void UpdateFilterComboBox()
        {
            if (_statusFilterCombo != null && FilterOptions != null)
            {
                _statusFilterCombo.ItemsSource = FilterOptions;
                _statusFilterCombo.SelectedItem = SelectedFilter;
            }
        }

        private void OnItemsSourceChanged()
        {
            RefreshData();
        }

        private void OnColumnsChanged()
        {
            RefreshAll();
        }

        private void OnPaginationChanged()
        {
            RefreshData();
        }

        private void OnSearchTextChanged()
        {
            CurrentPage = 1;
            RefreshData();
        }

        private void UpdatePagination()
        {
            if (ItemsSource == null) return;

            var totalItems = ItemsSource.Cast<object>().Count();
            TotalPages = (int)Math.Ceiling((double)totalItems / PageSize);

            if (CurrentPage > TotalPages)
                CurrentPage = Math.Max(1, TotalPages);

            ShowNavigationButtons = TotalPages > 1;
            UpdatePaginationText();
            UpdatePaginationInfo(totalItems);
        }

        private void UpdatePaginationText()
        {
            if (TotalPages <= 1)
            {
                PaginationText = TextResource.PaginationSinglePage;
            }
            else
            {
                PaginationText = string.Format(TextResource.PaginationPageInfo, CurrentPage, TotalPages);
            }
        }

        private void UpdatePaginationInfo(int totalItems)
        {
            if (totalItems > 0)
            {
                var startItem = (CurrentPage - 1) * PageSize + 1;
                var endItem = Math.Min(CurrentPage * PageSize, totalItems);
                PaginationInfo = string.Format(TextResource.PaginationShowingItems, startItem, endItem, totalItems);
            }
            else
            {
                PaginationInfo = TextResource.PaginationNoItems;
            }
        }

        private void BuildHeaders()
        {
            if (_headerGrid == null || Columns == null) return;

            _headerGrid.Children.Clear();
            _headerGrid.ColumnDefinitions.Clear();

            for (int i = 0; i < Columns.Count; i++)
            {
                var column = Columns[i];
                _headerGrid.ColumnDefinitions.Add(new ColumnDefinition(column.Width));

                var headerText = new TextBlock
                {
                    Text = column.Header,
                    Classes = { "header-text" }
                };

                Grid.SetColumn(headerText, i);
                _headerGrid.Children.Add(headerText);
            }
        }

        private void BuildRows()
        {
            if (_itemsControl == null || Columns == null) return;

            var paginatedData = GetPaginatedData();

            var dataTemplate = new FuncDataTemplate<object>((item, _) =>
            {
                var border = new Border
                {
                    Classes = { "table-row" },
                    Cursor = new Cursor(StandardCursorType.Hand)
                };

                var grid = new Grid();

                foreach (var column in Columns)
                {
                    grid.ColumnDefinitions.Add(new ColumnDefinition(column.Width));
                }

                for (int i = 0; i < Columns.Count; i++)
                {
                    var column = Columns[i];
                    var cellText = new TextBlock();

                    var styleClasses = column.CellStyle.Split(' ');
                    foreach (var styleClass in styleClasses.Where(styleClass => !string.IsNullOrWhiteSpace(styleClass)))
                    {
                        cellText.Classes.Add(styleClass);
                    }

                    if (!string.IsNullOrEmpty(column.Binding))
                    {
                        try
                        {
                            var binding = new Binding(column.Binding);
                            cellText.Bind(TextBlock.TextProperty, binding);
                        }
                        catch
                        {
                            cellText.Text = "N/A";
                        }
                    }

                    Grid.SetColumn(cellText, i);
                    grid.Children.Add(cellText);
                }

                border.Child = grid;

                border.PointerPressed += (sender, e) =>
                {
                    if (e.GetCurrentPoint(border).Properties.IsLeftButtonPressed)
                    {
                        OnRowClicked(item);
                    }
                };

                return border;
            });

            _itemsControl.ItemTemplate = dataTemplate;
            _itemsControl.ItemsSource = paginatedData;
        }

        private void OnRowClicked(object item)
        {
            if (RowClickCommand?.CanExecute(item) == true)
            {
                RowClickCommand.Execute(item);
            }
        }

        private IEnumerable GetPaginatedData()
        {
            if (ItemsSource == null) return new List<object>();

            var items = ItemsSource.Cast<object>().ToList();
            var skipCount = (CurrentPage - 1) * PageSize;

            return items.Skip(skipCount).Take(PageSize).ToList();
        }

        // Pagination navigation methods
        private void GoToFirstPage()
        {
            if (CurrentPage > 1)
            {
                CurrentPage = 1;
            }
        }

        private void GoToPreviousPage()
        {
            if (CurrentPage > 1)
            {
                CurrentPage--;
            }
        }

        private void GoToNextPage()
        {
            if (CurrentPage < TotalPages)
            {
                CurrentPage++;
            }
        }

        private void GoToLastPage()
        {
            if (CurrentPage < TotalPages)
            {
                CurrentPage = TotalPages;
            }
        }
    }

    public class DataTableColumn
    {
        public string Header { get; set; } = "";
        public string Binding { get; set; } = "";
        public GridLength Width { get; set; } = GridLength.Auto;
        public string CellStyle { get; set; } = "cell-text";
    }
}