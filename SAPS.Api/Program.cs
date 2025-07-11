using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SAPS.Api.Mapping;
using SAPS.Api.Models.Generated;
using SAPS.Api.Repository;
using SAPS.Api.Service;
using Scalar.AspNetCore;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;

var builder = WebApplication.CreateBuilder(args);

// Create reusable JSON options to ensure consistency across the application
var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web)
{
    // Handle circular references
    ReferenceHandler = ReferenceHandler.IgnoreCycles,
    
    // Increase MaxDepth (default is 64)
    MaxDepth = 256, // Much higher value to ensure it's not hit
    
    // Optional - reduce case sensitivity issues
    PropertyNameCaseInsensitive = true,

    // Determine whether to write default values (null, 0, etc.)
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
};

// Configure the TypeInfoResolver for handling deep hierarchies
jsonOptions.TypeInfoResolver = new DefaultJsonTypeInfoResolver
{
    Modifiers = { MaxDepthModifier }
};

// Helper function to modify JSON schema generation to prevent MaxDepth errors
static void MaxDepthModifier(JsonTypeInfo jsonTypeInfo)
{
    // Skip navigation properties that can cause circular references in EF models
    if (jsonTypeInfo.Kind == JsonTypeInfoKind.Object && 
        jsonTypeInfo.Type.Assembly.FullName?.Contains("SAPS.Api") == true)
    {
        for (int i = 0; i < jsonTypeInfo.Properties.Count; i++)
        {
            JsonPropertyInfo prop = jsonTypeInfo.Properties[i];
            
            // Skip navigation properties to prevent circular references
            Type propType = prop.PropertyType;
            if ((propType != null && propType.IsGenericType && propType.GetGenericTypeDefinition() == typeof(ICollection<>)) ||
                (propType?.Namespace == "SAPS.Api.Models.Generated" && 
                 propType != typeof(string) && 
                 !propType.IsPrimitive))
            {
                prop.Get = null;
                prop.Set = null;
            }
        }
    }
}

// Configure controllers with proper JSON serialization options
builder.Services.AddControllers().AddJsonOptions(options => {
    options.JsonSerializerOptions.ReferenceHandler = jsonOptions.ReferenceHandler;
    options.JsonSerializerOptions.MaxDepth = jsonOptions.MaxDepth;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = jsonOptions.PropertyNameCaseInsensitive;
    options.JsonSerializerOptions.DefaultIgnoreCondition = jsonOptions.DefaultIgnoreCondition;
    options.JsonSerializerOptions.TypeInfoResolver = jsonOptions.TypeInfoResolver;
});

// Configure OpenAPI with proper depth handling
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();

// Configure System.Text.Json default options globally
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options => {
    options.SerializerOptions.ReferenceHandler = jsonOptions.ReferenceHandler;
    options.SerializerOptions.MaxDepth = jsonOptions.MaxDepth;
    options.SerializerOptions.PropertyNameCaseInsensitive = jsonOptions.PropertyNameCaseInsensitive;
    options.SerializerOptions.DefaultIgnoreCondition = jsonOptions.DefaultIgnoreCondition;
    options.SerializerOptions.TypeInfoResolver = jsonOptions.TypeInfoResolver;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowWeb",
        builder =>
        {
            builder
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

// C?u hình DbContext v?i connection string t? appsettings.json
builder.Services.AddDbContext<SapsContext>(options => 
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default"));
});

// ??ng ký AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// C?p nh?t authorization policy ?? s? d?ng roles t? database
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"))
    .AddPolicy("StaffAccess", policy => policy.RequireRole("Staff"));

// C?u hình JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
        
        // Configure JWT bearer to use the same JSON serialization options
        options.MapInboundClaims = true;
    });

// ??ng ký các service
builder.Services.AddTransient<JwtService>();
builder.Services.AddTransient<AuthService>();
builder.Services.AddTransient<GoogleAuthService>();
builder.Services.AddTransient<IUserRepository, UserRepository>();

// ??ng ký các service cho Admin
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IAdminService, AdminService>();

// Make the jsonOptions available through DI if needed
builder.Services.AddSingleton(jsonOptions);

var app = builder.Build();

// C?u hình pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
    
    // Enable detailed exceptions in development
    app.UseDeveloperExceptionPage();
}
else
{
    // Use the exception handler middleware in production
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseCors("AllowWeb");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
