# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY BelaDesignHub.sln ./
COPY BelaDesignHub.Api/BelaDesignHub.Api.csproj BelaDesignHub.Api/
RUN dotnet restore BelaDesignHub.Api/BelaDesignHub.Api.csproj

COPY . .
WORKDIR /src/BelaDesignHub.Api
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "BelaDesignHub.Api.dll"]
