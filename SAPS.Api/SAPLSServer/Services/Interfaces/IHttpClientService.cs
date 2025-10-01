namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides an abstraction for making HTTP requests, including GET, POST, PUT, DELETE, and PATCH operations.
    /// Supports adding custom headers and handling request/response data with generic types.
    /// </summary>
    public interface IHttpClientService
    {
        /// <summary>
        /// Sends an HTTP GET request to the specified URL and returns the response as a string.
        /// </summary>
        /// <param name="url">The URL to send the GET request to.</param>
        /// <param name="headers">Optional headers to include in the request.</param>
        /// <returns>A task representing the asynchronous operation, with the response as a string.</returns>
        Task<string> GetAsync(string url, Dictionary<string, string>? headers = null);

        /// <summary>
        /// Sends an HTTP GET request to the specified URL and returns the response as a strongly-typed object.
        /// </summary>
        /// <typeparam name="TResult">The type of the response object.</typeparam>
        /// <param name="url">The URL to send the GET request to.</param>
        /// <param name="headers">Optional headers to include in the request.</param>
        /// <returns>A task representing the asynchronous operation, with the response as <typeparamref name="TResult"/>.</returns>
        Task<TResult?> GetAsync<TResult>(string url, Dictionary<string, string>? headers = null);

        /// <summary>
        /// Sends an HTTP POST request with a request body to the specified URL and returns the response as a string.
        /// </summary>
        /// <param name="url">The URL to send the POST request to.</param>
        /// <param name="body">The request body to include in the POST request.</param>
        /// <param name="headers">Optional headers to include in the request.</param>
        /// <returns>A task representing the asynchronous operation, with the response as a string.</returns>
        Task<string> PostAsync(string url, string body, Dictionary<string, string>? headers = null);

        /// <summary>
        /// Sends an HTTP POST request with a request body to the specified URL and returns the response as a strongly-typed object.
        /// </summary>
        /// <typeparam name="TRequest">The type of the request body.</typeparam>
        /// <typeparam name="TResult">The type of the response object.</typeparam>
        /// <param name="url">The URL to send the POST request to.</param>
        /// <param name="body">The request body to include in the POST request.</param>
        /// <param name="headers">Optional headers to include in the request.</param>
        /// <returns>A task representing the asynchronous operation, with the response as <typeparamref name="TResult"/>.</returns>
        Task<TResult?> PostAsync<TRequest, TResult>(string url, TRequest body, Dictionary<string, string>? headers = null);

        /// <summary>
        /// Sends an HTTP PUT request with a request body to the specified URL and returns the response as a string.
        /// </summary>
        /// <param name="url">The URL to send the PUT request to.</param>
        /// <param name="body">The request body to include in the PUT request.</param>
        /// <param name="headers">Optional headers to include in the request.</param>
        /// <returns>A task representing the asynchronous operation, with the response as a string.</returns>
        Task<string> PutAsync(string url, string body, Dictionary<string, string>? headers = null);

        /// <summary>
        /// Sends an HTTP PUT request with a request body to the specified URL and returns the response as a strongly-typed object.
        /// </summary>
        /// <typeparam name="TRequest">The type of the request body.</typeparam>
        /// <typeparam name="TResult">The type of the response object.</typeparam>
        /// <param name="url">The URL to send the PUT request to.</param>
        /// <param name="body">The request body to include in the PUT request.</param>
        /// <param name="headers">Optional headers to include in the request.</param>
        /// <returns>A task representing the asynchronous operation, with the response as <typeparamref name="TResult"/>.</returns>
        Task<TResult?> PutAsync<TRequest, TResult>(string url, TRequest body, Dictionary<string, string>? headers = null);

        /// <summary>
        /// Sends an HTTP DELETE request to the specified URL and returns the response as a string.
        /// </summary>
        /// <param name="url">The URL to send the DELETE request to.</param>
        /// <param name="headers">Optional headers to include in the request.</param>
        /// <returns>A task representing the asynchronous operation, with the response as a string.</returns>
        Task<string> DeleteAsync(string url, Dictionary<string, string>? headers = null);

        /// <summary>
        /// Sends an HTTP DELETE request to the specified URL and returns the response as a strongly-typed object.
        /// </summary>
        /// <typeparam name="TResult">The type of the response object.</typeparam>
        /// <param name="url">The URL to send the DELETE request to.</param>
        /// <param name="headers">Optional headers to include in the request.</param>
        /// <returns>A task representing the asynchronous operation, with the response as <typeparamref name="TResult"/>.</returns>
        Task<TResult?> DeleteAsync<TResult>(string url, Dictionary<string, string>? headers = null);

        /// <summary>
        /// Sends an HTTP PATCH request with a request body to the specified URL and returns the response as a string.
        /// </summary>
        /// <param name="url">The URL to send the PATCH request to.</param>
        /// <param name="body">The request body to include in the PATCH request.</param>
        /// <param name="headers">Optional headers to include in the request.</param>
        /// <returns>A task representing the asynchronous operation, with the response as a string.</returns>
        Task<string> PatchAsync(string url, string body, Dictionary<string, string>? headers = null);

        /// <summary>
        /// Sends an HTTP PATCH request with a request body to the specified URL and returns the response as a strongly-typed object.
        /// </summary>
        /// <typeparam name="TRequest">The type of the request body.</typeparam>
        /// <typeparam name="TResult">The type of the response object.</typeparam>
        /// <param name="url">The URL to send the PATCH request to.</param>
        /// <param name="body">The request body to include in the PATCH request.</param>
        /// <param name="headers">Optional headers to include in the request.</param>
        /// <returns>A task representing the asynchronous operation, with the response as <typeparamref name="TResult"/>.</returns>
        Task<TResult?> PatchAsync<TRequest, TResult>(string url, TRequest body, Dictionary<string, string>? headers = null);
    }
}