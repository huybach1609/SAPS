using SAPLSServer.Services.Interfaces;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SAPLSServer.Services.Implementations
{
    public class HttpClientService : IHttpClientService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<HttpClientService> _logger;
        public HttpClientService(HttpClient httpClient, ILogger<HttpClientService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        // GET
        public async Task<string> GetAsync(string url, Dictionary<string, string>? headers = null)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            AddHeaders(request, headers);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<TResult?> GetAsync<TResult>(string url, Dictionary<string, string>? headers = null)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            AddHeaders(request, headers);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<TResult>(content);
        }

        // POST
        public async Task<string> PostAsync(string url, string body, Dictionary<string, string>? headers = null)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StringContent(body, Encoding.UTF8, "application/json")
            };
            AddHeaders(request, headers);
            _logger.LogInformation("POST Request to {Url} with body: {Body}", url, body);
            var response = await _httpClient.SendAsync(request);
            _logger.LogInformation("POST {Response}: ",response);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<TResult?> PostAsync<TRequest, TResult>(string url, TRequest body, Dictionary<string, string>? headers = null)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = CreateJsonContent(body)
            };
            AddHeaders(request, headers);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<TResult>(content);
        }

        // PUT
        public async Task<string> PutAsync(string url, string body, Dictionary<string, string>? headers = null)
        {
            var request = new HttpRequestMessage(HttpMethod.Put, url)
            {
                Content = new StringContent(body, Encoding.UTF8, "application/json")
            };
            AddHeaders(request, headers);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<TResult?> PutAsync<TRequest, TResult>(string url, TRequest body, Dictionary<string, string>? headers = null)
        {
            var request = new HttpRequestMessage(HttpMethod.Put, url)
            {
                Content = CreateJsonContent(body)
            };
            AddHeaders(request, headers);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<TResult>(content);
        }

        // DELETE
        public async Task<string> DeleteAsync(string url, Dictionary<string, string>? headers = null)
        {
            var request = new HttpRequestMessage(HttpMethod.Delete, url);
            AddHeaders(request, headers);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<TResult?> DeleteAsync<TResult>(string url, Dictionary<string, string>? headers = null)
        {
            var request = new HttpRequestMessage(HttpMethod.Delete, url);
            AddHeaders(request, headers);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<TResult>(content);
        }

        // PATCH
        public async Task<string> PatchAsync(string url, string body, Dictionary<string, string>? headers = null)
        {
            var request = new HttpRequestMessage(HttpMethod.Patch, url)
            {
                Content = new StringContent(body, Encoding.UTF8, "application/json")
            };
            AddHeaders(request, headers);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<TResult?> PatchAsync<TRequest, TResult>(string url, TRequest body, Dictionary<string, string>? headers = null)
        {
            var request = new HttpRequestMessage(HttpMethod.Patch, url)
            {
                Content = CreateJsonContent(body)
            };
            AddHeaders(request, headers);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<TResult>(content);
        }

        private static void AddHeaders(HttpRequestMessage request, Dictionary<string, string>? headers)
        {
            if (headers == null) return;

            foreach (var header in headers)
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }
        }

        private static StringContent CreateJsonContent<TRequest>(TRequest body)
        {
            var json = JsonSerializer.Serialize(body);
            return new StringContent(json, Encoding.UTF8, "application/json");
        }
    }
}
