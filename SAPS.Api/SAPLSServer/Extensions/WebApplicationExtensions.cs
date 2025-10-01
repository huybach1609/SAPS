namespace SAPLSServer.Extensions
{
    public static class WebApplicationExtensions
    {
        /// <summary>
        /// Configure the HTTP request pipeline
        /// </summary>
        /// <param name="app">Web application</param>
        /// <returns>Web application for chaining</returns>
        public static WebApplication ConfigurePipeline(this WebApplication app)
        {
            // Configure development environment
            if (app.Environment.IsDevelopment())
            {
                app.ConfigureDevelopment();
                app.UseSwaggerUI();
            }
            else
            {
                app.ConfigureProduction();
            }

            // Configure common middleware
            app.UseHttpsRedirection();
            if (app.Environment.IsDevelopment())
            {
                app.UseCors("DefaultPolicy");
            }
            else
            {
                app.UseCors("ProductionPolicy");
            }
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();


            return app;
        }

        /// <summary>
        /// Configure development-specific middleware
        /// </summary>
        /// <param name="app">Web application</param>
        /// <returns>Web application for chaining</returns>
        public static WebApplication ConfigureDevelopment(this WebApplication app)
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "SAPLS Server API v1");
                options.RoutePrefix = string.Empty; // Serve Swagger UI at root
            });

            return app;
        }

        /// <summary>
        /// Configure production-specific middleware
        /// </summary>
        /// <param name="app">Web application</param>
        /// <returns>Web application for chaining</returns>
        public static WebApplication ConfigureProduction(this WebApplication app)
        {
            app.UseHsts();
            app.UseExceptionHandler("/Error");

            return app;
        }
    }
}


