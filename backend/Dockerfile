FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["EventosAPI.API/EventosAPI.API.csproj", "EventosAPI.API/"]
COPY ["EventosAPI.Application/EventosAPI.Application.csproj", "EventosAPI.Application/"]
COPY ["EventosAPI.Domain/EventosAPI.Domain.csproj", "EventosAPI.Domain/"]
COPY ["EventosAPI.Infrastructure/EventosAPI.Infrastructure.csproj", "EventosAPI.Infrastructure/"]
RUN dotnet restore "EventosAPI.API/EventosAPI.API.csproj"
COPY . .
WORKDIR "/src/EventosAPI.API"
RUN dotnet build "EventosAPI.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "EventosAPI.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "EventosAPI.API.dll"]
