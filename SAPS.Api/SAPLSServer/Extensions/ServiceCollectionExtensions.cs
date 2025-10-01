using Azure.Identity;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Logging; // Add this at the top if not present
using SAPLSServer.Constants;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Implementations;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Implementations;
using SAPLSServer.Services.Interfaces;
using System.Security.Claims;
using System.Text;

namespace SAPLSServer.Extensions
{
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Configure Azure Key Vault integration
        /// </summary>
        /// <param name="builder">Web application builder</param>
        /// <returns>Web application builder for chaining</returns>
        public static WebApplicationBuilder AddAzureKeyVault(this WebApplicationBuilder builder)
        {
            // Get Key Vault configuration from appsettings
            var keyVaultUrl = builder.Configuration[ConfigurationConstants.AzureKeyVaultVaultUrl];
            if (!string.IsNullOrWhiteSpace(keyVaultUrl))
            {
                // Add Azure Key Vault configuration
                builder.Configuration.AddAzureKeyVault(
                    new Uri(keyVaultUrl),
                    new Azure.Identity.DefaultAzureCredential());

                // Log all configuration values from Azure that match keys in ConfigurationConstants
                var logger = builder.Services.BuildServiceProvider().GetRequiredService<ILoggerFactory>()
                    .CreateLogger("AzureKeyVaultLogger");

                var configKeys = typeof(ConfigurationConstants)
                    .GetFields(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static)
                    .Where(f => f.FieldType == typeof(string))
                    .Select(f => (string)f.GetValue(null)!)
                    .ToList();

                foreach (var key in configKeys)
                {
                    var value = builder.Configuration[key];
                    if (!string.IsNullOrEmpty(value))
                    {
                        logger.LogInformation("Azure Key Vault configuration loaded: {Key} = {Value}", key, value);
                    }
                }
            }
            else
            {
                throw new EmptyConfigurationValueException(ConfigurationConstants.AzureKeyVaultVaultUrl);
            }
            return builder;
        }

        /// <summary>
        /// Register all application services
        /// </summary>
        /// <param name="services">Service collection</param>
        /// <returns>Service collection for chaining</returns>
        public static IServiceCollection AddApplicationServices(this IServiceCollection services,
            IConfiguration configuration, IWebHostEnvironment environment)
        {
            // Add DbContext for Entity Framework Core
            if (environment.IsDevelopment())
            {
                services.AddDbContext<SaplsContext>(opt =>
                {
                    opt.UseSqlServer(configuration.GetConnectionString(ConfigurationConstants.DefaultConnectionString));
                });
            }
            else
            {
                services.AddDbContext<SaplsContext>(opt =>
                {
                    opt.UseSqlServer(configuration[ConfigurationConstants.AzureConnectionString]);
                });
            }
            //Add singletons
            services.AddSingleton<IPromptProviderService, GeminiModelPromptProviderService>();
            services.AddSingleton<IMailSettings, MailKitSettings>();
            services.AddSingleton<ICitizenCardOcrSettings, CitizenCardGeminiOcrSettings>();
            services.AddSingleton<IVehicleRegistrationCertOcrSettings, VehicleRegistrationCertGeminiOcrSettings>();
            services.AddSingleton<IPaymentSettings, PaymentPayOsSettings>();
            services.AddSingleton<IAuthenticationSettings, JwtAuthenticationSettings>();
            services.AddSingleton<IGoogleOAuthSettings, GoogleOAuthSettings>();
            services.AddSingleton<IAzureBlobStorageSettings, AzureBlobStorageSettings>();
            services.AddSingleton<IFirebaseSettings, FirebaseSettings>();

            // Add Azure Blob Storage
            services.AddSingleton(provider =>
            {
                var settings = provider.GetRequiredService<IAzureBlobStorageSettings>();
                return new BlobServiceClient(settings.ConnectionString);
            });



            // Add repositories
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IClientProfileRepository, ClientProfileRepository>();
            services.AddScoped<IAdminProfileRepository, AdminProfileRepository>();
            services.AddScoped<IParkingLotOwnerProfileRepository, ParkingLotOwnerProfileRepository>();
            services.AddScoped<IStaffProfileRepository, StaffProfileRepository>();
            services.AddScoped<IVehicleRepository, VehicleRepository>();
            services.AddScoped<IParkingLotRepository, ParkingLotRepository>();
            services.AddScoped<ISharedVehicleRepository, SharedVehicleRepository>();
            services.AddScoped<IParkingSessionRepository, ParkingSessionRepository>();
            services.AddScoped<IRequestRepository, RequestRepository>();
            services.AddScoped<IParkingFeeScheduleRepository, ParkingFeeScheduleRepository>();
            services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
            services.AddScoped<IWhiteListRepository, WhiteListRepository>();
            services.AddScoped<IParkingLotShiftRepository, ParkingLotShiftRepository>();
            services.AddScoped<IShiftDiaryRepository, ShiftDiaryRepository>();
            services.AddScoped<IIncidenceReportRepository, IncidenceReportRepository>();
            services.AddScoped<IRequestAttachedFileRepository, RequestAttachedFileRepository>();
            services.AddScoped<IIncidenceEvidenceRepository, IncidenceEvidenceRepository>();
            services.AddScoped<IAttachedFileRepository, AttachedFileRepository>();

            // Add services
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IFirebaseNotificationService, FirebaseNotificationService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IClientService, ClientService>();
            services.AddScoped<IAdminService, AdminService>();
            services.AddScoped<IParkingLotOwnerService, ParkingLotOwnerService>();
            services.AddScoped<IStaffService, StaffService>();
            services.AddScoped<IMailSenderService, MailKitMailSenderService>();
            services.AddScoped<IPaymentService, PaymentPayOsService>();
            services.AddScoped<IPasswordService, PasswordService>();
            services.AddScoped<ICitizenCardOcrService, CitizenCardGeminiOcrService>();
            services.AddScoped<IVehicleRegistrationCertOcrService, VehicleRegistrationCertGeminiOcrService>();
            services.AddScoped<IFileService, AzureBlobFileService>();
            services.AddScoped<IOtpService, OtpService>();
            services.AddScoped<IVehicleShareCodeService, VehicleShareCodeService>();
            services.AddScoped<IVehicleService, VehicleService>();
            services.AddScoped<IParkingLotService, ParkingLotService>();
            services.AddScoped<ISharedVehicleService, SharedVehicleService>();
            services.AddScoped<IParkingSessionService, ParkingSessionService>();
            services.AddScoped<IRequestService, RequestService>();
            services.AddScoped<IParkingFeeScheduleService, ParkingFeeScheduleService>();
            services.AddScoped<ISubscriptionService, SubscriptionService>();
            services.AddScoped<IWhiteListService, WhiteListService>();
            services.AddScoped<IParkingLotShiftService, ParkingLotShiftService>();
            services.AddScoped<IShiftDiaryService, ShiftDiaryService>();
            services.AddScoped<IIncidentReportService, IncidentReportService>();
            services.AddScoped<ISharedVehicleNotificationService, SharedVehicleNotificationService>();
            services.AddScoped<IRequestAttachedFileService, RequestAttachedFileService>();
            services.AddScoped<IIncidenceEvidenceService, IncidenceEvidenceService>();

            services.AddHttpContextAccessor();

            return services;
        }

        /// <summary>
        /// Register external API services
        /// </summary>
        /// <param name="services">Service collection</param>
        /// <returns>Service collection for chaining</returns>
        public static IServiceCollection AddExternalServices(this IServiceCollection services)
        {
            // HTTP Client for external API calls
            services.AddHttpClient<IHttpClientService, HttpClientService>();
            // AI/OCR Services
            return services;
        }

        /// <summary>
        /// Register API documentation services
        /// </summary>
        /// <param name="services">Service collection</param>
        /// <returns>Service collection for chaining</returns>
        public static IServiceCollection AddApiDocumentation(this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();
            services.AddControllers().AddJsonOptions(opts =>
            {
                opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            });
            services.AddRouting(opts =>
            {
                opts.LowercaseUrls = true;
            });

            return services;
        }

        /// <summary>
        /// Register Swagger for API documentation
        /// </summary>
        /// <param name="services"></param>
        /// <returns></returns>
        public static IServiceCollection AddSwagger(this IServiceCollection services)
        {
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Title = "SAPLS Server API",
                    Version = "v1",
                    Description = "Smart Automated Parking Lot System API"
                });

                // ADD JWT SUPPORT TO SWAGGER
                options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                    Name = "Authorization",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });

                // Include XML documentation if available
                var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                {
                    options.IncludeXmlComments(xmlPath);
                }
            });
            return services;
        }

        /// <summary>
        /// Register CORS policies
        /// </summary>
        /// <param name="services">Service collection</param>
        /// <returns>Service collection for chaining</returns>
        public static IServiceCollection AddCorsConfiguration(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("DefaultPolicy", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });

                options.AddPolicy("ProductionPolicy", policy =>
                {
                    policy.WithOrigins(
                        "https://*.weback1609.io.vn",
                        "https://anemosnguyen2409.southeastasia.cloudapp.azure.com",
                        "http://localhost:5173",
                        "http://192.168.1.23:5173")
                          .SetIsOriginAllowedToAllowWildcardSubdomains()
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
                });
            });

            return services;
        }

        /// <summary>
        /// Add JWT authentication to the service collection
        /// </summary>
        /// <param name="services">Service collection</param>
        /// <param name="configuration">Application configuration</param>
        /// <returns>Service collection for chaining</returns>
        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultSignInScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = configuration[ConfigurationConstants.JwtIssuer],
                    ValidateAudience = true,
                    ValidAudience = configuration[ConfigurationConstants.JwtAudience],

                    ClockSkew = TimeSpan.FromMinutes(5),
                    ValidateLifetime = true,

                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(configuration[ConfigurationConstants.JwtSecretKey] ?? throw new EmptyConfigurationValueException())),
                    RoleClaimType = ClaimTypes.Role,
                    NameClaimType = ClaimTypes.Name,
                    RequireSignedTokens = true,
                    RequireExpirationTime = true,
                };
            })
            .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
            {
                options.ClientId = configuration[ConfigurationConstants.GoogleAuthClientId] ?? throw new EmptyConfigurationValueException("Authentication:Google:ClientId");
                options.ClientSecret = configuration[ConfigurationConstants.GoogleAuthClientSecret] ?? throw new EmptyConfigurationValueException("Authentication:Google:ClientSecret");
                // Configure callback URLs properly
                options.CallbackPath = "/api/auth/google-callback";

                // Configure OAuth endpoints (these are the correct Google URLs)
                options.AuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
                options.TokenEndpoint = "https://oauth2.googleapis.com/token";
                options.UserInformationEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";

                // Request necessary scopes
                options.Scope.Clear(); // Clear default scopes first
                options.Scope.Add("openid");
                options.Scope.Add("profile");
                options.Scope.Add("email");

                options.ClaimActions.MapJsonKey(ClaimTypes.NameIdentifier, "id");
                options.ClaimActions.MapJsonKey(ClaimTypes.Name, "name");
                options.ClaimActions.MapJsonKey(ClaimTypes.Email, "email");

                options.AccessDeniedPath = "/auth/access-denied";
                options.RemoteAuthenticationTimeout = TimeSpan.FromMinutes(5);

                options.Events.OnRemoteFailure = context =>
                {
                    context.Response.Redirect("/auth/login?error=google_auth_failed");
                    context.HandleResponse();
                    return Task.CompletedTask;
                };
            });
            return services;
        }

        public static IServiceCollection AddJwtAuthorization(this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                options.AddPolicy(Accessibility.STAFF_ACCESS, policy =>
                    policy.RequireRole(UserRole.Staff.ToString())
                          .RequireAuthenticatedUser());

                options.AddPolicy(Accessibility.CLIENT_ACCESS, policy =>
                    policy.RequireRole(UserRole.Client.ToString())
                          .RequireAuthenticatedUser());

                options.AddPolicy(Accessibility.ADMIN_ACCESS, policy =>
                    policy.RequireRole(UserRole.Admin.ToString())
                          .RequireAuthenticatedUser());

                options.AddPolicy(Accessibility.PARKING_LOT_OWNER_ACCESS, policy =>
                    policy.RequireRole(UserRole.ParkingLotOwner.ToString())
                    .RequireAuthenticatedUser());

                options.AddPolicy(Accessibility.ADMIN_PARKINGLOT_OWNER_ACCESS, policy =>
                    policy.RequireRole(UserRole.Admin.ToString(), UserRole.ParkingLotOwner.ToString())
                          .RequireAuthenticatedUser());

                options.AddPolicy(Accessibility.ADMIN_CLIENT_ACCESS, policy =>
                    policy.RequireRole(UserRole.Admin.ToString(), UserRole.Client.ToString())
                          .RequireAuthenticatedUser());

                options.AddPolicy(Accessibility.HEAD_ADMIN_ACCESS, policy =>
                    policy.RequireRole(UserRole.Admin.ToString())
                    .RequireClaim(nameof(AdminRole), AdminRole.HeadAdmin.ToString())
                    .RequireAuthenticatedUser());

                options.AddPolicy(Accessibility.PARKING_LOT_OWNER_OR_STAFF_ACCESS, policy =>
                   policy.RequireRole(UserRole.ParkingLotOwner.ToString(), UserRole.Staff.ToString())
                          .RequireAuthenticatedUser());
            });
            return services;
        }
    }
}