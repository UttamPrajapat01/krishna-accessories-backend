FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["KrishnaAccessories.Core/KrishnaAccessories.Core.csproj", "KrishnaAccessories.Core/"]
COPY ["KrishnaAccessories.Application/KrishnaAccessories.Application.csproj", "KrishnaAccessories.Application/"]
COPY ["KrishnaAccessories.Infrastructure/KrishnaAccessories.Infrastructure.csproj", "KrishnaAccessories.Infrastructure/"]
COPY ["KrishnaAccessories.API/KrishnaAccessories.API.csproj", "KrishnaAccessories.API/"]

RUN dotnet restore "KrishnaAccessories.API/KrishnaAccessories.API.csproj"

COPY . .
WORKDIR "/src/KrishnaAccessories.API"
RUN dotnet publish "KrishnaAccessories.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "KrishnaAccessories.API.dll"]
