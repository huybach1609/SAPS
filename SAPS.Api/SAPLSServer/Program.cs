using SAPLSServer.Constants;
using SAPLSServer.Extensions;

namespace SAPLSServer
{
    //TODO: Logged in staff out of shift
    //TODO: Vehicle is still parked while the sharing deadline is reached or expired
    internal static class Program
    {
        private static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add Azure Key Vault if needed
            if(builder.Environment.IsProduction())
            {
                //builder.AddAzureKeyVault();
            }
            // Configure services
            builder.Services.AddApplicationServices(builder.Configuration, builder.Environment);
            builder.Services.AddExternalServices();
            builder.Services.AddApiDocumentation();
            if(builder.Environment.IsDevelopment())
            {
                builder.Services.AddSwagger();
            }

            builder.Services.AddCorsConfiguration();
            builder.Services.AddJwtAuthentication(builder.Configuration);
            builder.Services.AddJwtAuthorization();

            var app = builder.Build();

            // Configure pipeline
            app.ConfigurePipeline();
            app.Run();
        }
    }
}