# Sử dụng SDK image để build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj và restore dependencies
COPY ["SAPLSServer.csproj", "."]
RUN dotnet restore "SAPLSServer.csproj"

# Copy toàn bộ source code và build
COPY . .
RUN dotnet build "SAPLSServer.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SAPLSServer.csproj" -c Release -o /app/publish

# Sử dụng runtime image để chạy app
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port
EXPOSE 7211
EXPOSE 7212

ENTRYPOINT ["dotnet", "SAPLSServer.dll"]

