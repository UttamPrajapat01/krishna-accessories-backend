FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["backend/KrishnaAccessories.Core/KrishnaAccessories.Core.csproj", "backend/KrishnaAccessories.Core/"]
COPY ["backend/KrishnaAccessories.Application/KrishnaAccessories.Application.csproj", "backend/KrishnaAccessories.Application/"]
COPY ["backend/KrishnaAccessories.Infrastructure/KrishnaAccessories.Infrastructure.csproj", "backend/KrishnaAccessories.Infrastructure/"]
COPY ["backend/KrishnaAccessories.API/KrishnaAccessories.API.csproj", "backend/KrishnaAccessories.API/"]

RUN dotnet restore "backend/KrishnaAccessories.API/KrishnaAccessories.API.csproj"

COPY backend/ backend/
WORKDIR "/src/backend/KrishnaAccessories.API"
RUN dotnet publish "KrishnaAccessories.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "KrishnaAccessories.API.dll"]
