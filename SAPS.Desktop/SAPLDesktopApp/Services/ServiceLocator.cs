using Microsoft.Extensions.DependencyInjection;
using System;

namespace SAPLDesktopApp.Services
{
    /// <summary>
    /// Simple service locator for desktop applications
    /// </summary>
    public static class ServiceLocator
    {
        private static IServiceProvider? _serviceProvider;

        /// <summary>
        /// Configure services for the application
        /// </summary>
        public static void ConfigureServices(Action<IServiceCollection> configureServices)
        {
            var services = new ServiceCollection();
            configureServices(services);
            _serviceProvider = services.BuildServiceProvider();
        }

        /// <summary>
        /// Get a service of type T
        /// </summary>
        public static T GetService<T>() where T : notnull
        {
            if (_serviceProvider == null)
                throw new InvalidOperationException("Services not configured. Call ConfigureServices first.");
            
            return _serviceProvider.GetRequiredService<T>();
        }

        /// <summary>
        /// Get a service by type
        /// </summary>
        public static object GetService(Type serviceType)
        {
            if (_serviceProvider == null)
                throw new InvalidOperationException("Services not configured. Call ConfigureServices first.");
            
            return _serviceProvider.GetRequiredService(serviceType);
        }

        /// <summary>
        /// Get the service provider
        /// </summary>
        internal static IServiceProvider ServiceProvider => _serviceProvider 
            ?? throw new InvalidOperationException("Services not configured.");
    }
}