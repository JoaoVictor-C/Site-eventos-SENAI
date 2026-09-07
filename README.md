# Eventos SENAI — event and ticketing platform

Event management for an educational institution: publish an event, sell tickets in batches, validate them at the door, and watch attendance in real time.

Built for SENAI Lençóis Paulista and **used at a real institutional event, where 300+ tickets were sold and validated through the platform.**

---

## What it does

| | |
|---|---|
| **Events** | Create and publish events with descriptions, dates, capacity and staff roles |
| **Batch pricing** | Tickets are sold in `Batch`es, so early-bird and full-price tiers are separate objects with their own limits |
| **Orders and tickets** | An `Order` reserves tickets; each `Ticket` carries a QR code and its own lifecycle |
| **Door validation** | A dedicated gatekeeper screen validates a QR code and marks the ticket used, atomically |
| **Analytics** | Sales and attendance dashboards for organisers |
| **Auth** | Email/password with BCrypt, Google OAuth, JWT access tokens and rotating refresh tokens |

### The ticket lifecycle is the core of it

A ticket is not a boolean. `TicketStatus` is `Pending`, `Used`, `Canceled` or `Expired`, and validity is derived rather than stored:

```csharp
public bool IsUsed     => Status == TicketStatus.Used && UsedAt.HasValue;
public bool IsExpired  => Status == TicketStatus.Expired ||
                          (Batch.Event.EndDate < DateTime.UtcNow && Status != TicketStatus.Used);
public bool IsValid    => IsActive && !IsUsed && !IsCanceled && !IsExpired;
```

This matters at the door: the failure mode of a ticketing system is the same ticket being admitted twice, so "has this been used" is computed from `UsedAt`, and expiry falls out of the event's own end date instead of needing a job to sweep the table.

## Architecture

Clean Architecture, four projects, dependencies pointing inward:

```
Backend/
├─ EventosAPI.Domain/          entities, enums, repository interfaces — no dependencies
├─ EventosAPI.Application/     services, DTOs, validators, AutoMapper profiles
├─ EventosAPI.Infrastructure/  EF Core DbContext, repositories, migrations
└─ EventosAPI.API/             controllers, middleware, DI wiring
```

`Domain` knows nothing about EF Core or ASP.NET. Entities validate themselves through `BaseEntity.Validate(out List<string> errors)`, so a rule about what makes a ticket well-formed lives with the ticket rather than in a controller.

**Frontend** is feature-sliced rather than layer-sliced — `features/admin`, `features/tickets`, `features/gatekeeper`, `features/payment` each own their pages, hooks and API calls.

## Stack

**Backend** — .NET 8 · ASP.NET Core · Entity Framework Core with Pomelo MySQL · MediatR · AutoMapper · FluentValidation · Serilog · JWT Bearer · BCrypt · Swagger

**Frontend** — React 18 · TypeScript · Vite · TanStack Query · React Hook Form · Tailwind CSS · Radix UI · Chart.js · Framer Motion

**Infrastructure** — Docker Compose (API + MySQL + frontend), 5 EF Core migrations

## Running it

```bash
docker compose up --build
```

Frontend on `http://localhost:3000`, API on `http://localhost:5027`, Swagger at `/swagger`.

Running the backend on its own:

```bash
cd Backend && dotnet run --project EventosAPI.API
```

The connection string is read from `ConnectionStrings__DefaultConnection`; see `docker-compose.yml` for the shape it expects. Migrations apply on startup.

## API

Versioned under `/api/v1`.

| Controller | Purpose |
|---|---|
| `AuthController` · `GoogleAuthController` | Register, login, refresh, Google OAuth |
| `EventsController` | Event CRUD, publishing, batches |
| `TicketsController` | `reserve`, `{orderId}/validate`, `{orderId}/cancel`, `my-tickets`, `event/{eventId}` |
| `EventRolesController` | Staff and gatekeeper assignment per event |
| `AnalyticsController` | Sales and attendance aggregates |
| `UsersController` | Profile and administration |

## Status

Built in 2024 as an institutional project and used in production for a real event. Not actively maintained — it is kept public as a reference implementation.

## License

See [LICENSE](LICENSE).
