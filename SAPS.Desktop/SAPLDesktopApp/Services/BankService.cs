using SAPLDesktopApp.Dtos.BankDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public sealed class BankService : IBankService
    {
        private readonly IFileManagementService _fileManagementService;
        private readonly List<BankItem> _banks = new();
        private DateTime _lastUpdatedTime = DateTime.MinValue;
        private readonly HttpClient _httpClient;
        private const int CACHE_EXPIRY_HOURS = 24;
        private readonly object _lockObject = new();
        
        public BankService(IFileManagementService fileManagementService)
        {
            _fileManagementService = fileManagementService ?? throw new ArgumentNullException(nameof(fileManagementService));
            _httpClient = new HttpClient();
            
            // Initialize bank data during construction
            _ = Task.Run(InitializeBankDataAsync);
        }
        
        private async Task InitializeBankDataAsync()
        {
            try
            {
                System.Diagnostics.Debug.WriteLine("BankService: Initializing bank data during construction");
                
                // Try to load from local cache first
                var cachedBankListJson = await _fileManagementService.GetBankListData();
                BankListStoreDto? cachedBankList = null;
                
                if (!string.IsNullOrEmpty(cachedBankListJson))
                {
                    try
                    {
                        cachedBankList = JsonSerializer.Deserialize<BankListStoreDto>(cachedBankListJson);
                        if (cachedBankList != null)
                        {
                            lock (_lockObject)
                            {
                                _lastUpdatedTime = cachedBankList.LastUpdated;
                                _banks.Clear();
                                _banks.AddRange(cachedBankList.Data);
                            }
                            System.Diagnostics.Debug.WriteLine($"BankService: Loaded {cachedBankList.Data.Count} banks from cache, last updated: {_lastUpdatedTime}");
                        }
                    }
                    catch (JsonException ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"BankService: Error deserializing cached bank list during initialization: {ex.Message}");
                    }
                }
                
                // Check if cache is valid, if not, fetch from API
                if (!IsCacheValid(_lastUpdatedTime))
                {
                    System.Diagnostics.Debug.WriteLine("BankService: Cache expired during initialization, fetching from API");
                    try
                    {
                        var response = await GetBankListAsync();
                        lock (_lockObject)
                        {
                            _banks.Clear();
                            _banks.AddRange(response.Data);
                        }
                        await CacheBankList(response.Data);
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"BankService: Failed to fetch bank list during initialization: {ex.Message}");
                        // Continue with cached data if available
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"BankService: Error during bank data initialization: {ex.Message}");
            }
        }
        
        public async Task<BankItem?> GetBank(string bin)
        {
            try
            {
                // Always check _lastUpdatedTime first
                await EnsureBankDataIsCurrentAsync();
                
                lock (_lockObject)
                {
                    return _banks.FirstOrDefault(b => b.Bin == bin);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"BankService: Error getting bank by BIN {bin}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<BankItem>> GetBanks()
        {
            try
            {
                // Always check _lastUpdatedTime first
                await EnsureBankDataIsCurrentAsync();
                
                lock (_lockObject)
                {
                    return new List<BankItem>(_banks);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"BankService: Error getting banks: {ex.Message}");
                throw;
            }
        }
        
        private async Task EnsureBankDataIsCurrentAsync()
        {
            // Check if cache is still valid
            if (IsCacheValid(_lastUpdatedTime))
            {
                return; // Data is still current
            }
            
            System.Diagnostics.Debug.WriteLine("BankService: Cache expired, refreshing bank data");
            
            try
            {
                var response = await GetBankListAsync();
                lock (_lockObject)
                {
                    _banks.Clear();
                    _banks.AddRange(response.Data);
                }
                await CacheBankList(response.Data);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"BankService: Failed to refresh bank data, using cached data: {ex.Message}");
                
                // If API fails, try to load any available cached data
                if (_banks.Count == 0)
                {
                    await LoadCachedDataAsBackup();
                }
            }
        }
        
        private async Task LoadCachedDataAsBackup()
        {
            try
            {
                var cachedBankListJson = await _fileManagementService.GetBankListData();
                if (!string.IsNullOrEmpty(cachedBankListJson))
                {
                    var cachedBankList = JsonSerializer.Deserialize<BankListStoreDto>(cachedBankListJson);
                    if (cachedBankList != null)
                    {
                        lock (_lockObject)
                        {
                            _lastUpdatedTime = cachedBankList.LastUpdated;
                            _banks.Clear();
                            _banks.AddRange(cachedBankList.Data);
                        }
                        System.Diagnostics.Debug.WriteLine("BankService: Loaded cached bank data as backup");
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"BankService: Error loading cached data as backup: {ex.Message}");
            }
        }
        
        private async Task<BankListResponseDto> GetBankListAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("https://api.vietqr.io/v2/banks");
                response.EnsureSuccessStatusCode();
                
                var jsonContent = await response.Content.ReadAsStringAsync();
                var bankListResponse = JsonSerializer.Deserialize<BankListResponseDto>(jsonContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                
                System.Diagnostics.Debug.WriteLine("BankService: Successfully fetched bank list from API");
                return bankListResponse ?? new BankListResponseDto();
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"BankService: HTTP error fetching bank list: {ex.Message}");
                throw;
            }
            catch (JsonException ex)
            {
                System.Diagnostics.Debug.WriteLine($"BankService: JSON deserialization error: {ex.Message}");
                throw;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"BankService: Unexpected error fetching bank list: {ex.Message}");
                throw;
            }
        }
        
        private static bool IsCacheValid(DateTime lastUpdated)
        {
            if (lastUpdated == DateTime.MinValue)
                return false;
                
            return DateTime.UtcNow - lastUpdated < TimeSpan.FromHours(CACHE_EXPIRY_HOURS);
        }
        
        private async Task CacheBankList(List<BankItem> banks)
        {
            try
            {
                var storeDto = new BankListStoreDto
                {
                    LastUpdated = DateTime.UtcNow,
                    Data = banks
                };
                
                lock (_lockObject)
                {
                    _lastUpdatedTime = storeDto.LastUpdated;
                }
                
                var json = JsonSerializer.Serialize(storeDto, new JsonSerializerOptions { WriteIndented = true });
                await _fileManagementService.StoreBankList(json);
                System.Diagnostics.Debug.WriteLine($"BankService: Bank list cached successfully, last updated: {_lastUpdatedTime}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"BankService: Error caching bank list: {ex.Message}");
                // Don't throw here - caching failure shouldn't break the main functionality
            }
        }
        
        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
}
