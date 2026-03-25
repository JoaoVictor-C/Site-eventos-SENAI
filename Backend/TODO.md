# Backend TODO (POI)

This file tracks **points of improvement (POI)** for the backend (`Backend/`), and the **optimized execution path** to address them.

## High-Level Architecture

- [ ] Confirm boundary ownership and reduce responsibility blur:
- [ ] `Backend/EventosAPI.API`: HTTP layer (controllers, middleware, DI setup).
- [ ] `Backend/EventosAPI.Application`: application services, DTOs, validators, mappings, app-level exceptions.
- [ ] `Backend/EventosAPI.Domain`: entities + domain rules.
- [ ] `Backend/EventosAPI.Infrastructure`: EF Core `DbContext`, repositories, migrations, security services.
- [ ] Clarify ownership for these “blurred” areas and refactor accordingly:
- [ ] Event roles (currently spread across API + Application + Infrastructure repositories).
- [ ] Orders/tickets flow (transactions, consistency, DTO shape).

## Build Status / Dependencies

- [ ] Fix NuGet vulnerability warning:
- [ ] Update `AutoMapper` from `12.0.1` (flagged high severity) in `Backend/EventosAPI.Application/EventosAPI.Application.csproj`.
- [ ] Fix nullable warnings in `Backend/EventosAPI.API/Controllers/v1/GoogleAuthController.cs`.
- [ ] Remove committed build output and runtime artifacts:
- [ ] `bin/`, `obj/`.
- [ ] `Backend/EventosAPI.API/Logs/*.txt`.

## Critical Security Findings (Fix These First)

- [x] Remove hard-coded secrets from source control:
- [x] Removed DB password and JWT key from `Backend/EventosAPI.API/appsettings.json` and `Backend/EventosAPI.API/appsettings.Development.json`.
- [x] Updated `docker-compose.yml` to use env vars (`JWT_KEY`, `MYSQL_ROOT_PASSWORD`) instead of hard-coded secrets.
- [ ] Add/update docs (README) for `.env` / user-secrets setup.

- [x] Fix 2FA endpoints account-takeover risk:
- [x] `Backend/EventosAPI.API/Controllers/v1/GoogleAuthController.cs`:
- [x] Removed unauthenticated, email-driven setup flow (now uses authenticated user).
- [ ] Consider a “re-auth” step before enabling/changing 2FA.

- [ ] Make JWT roles reliable (current `[Flags]` + single role claim is fragile):
- [ ] `Backend/EventosAPI.Domain/Enums/Enums.cs`: `UserRole` is `[Flags]`.
- [ ] `Backend/EventosAPI.Infrastructure/Security/TokenService.cs`: emits one role claim `user.Role.ToString()`.
- [ ] `Backend/EventosAPI.API/Controllers/ApiControllerBase.cs`: `IsCurrentUserAdmin()` uses `User.IsInRole("Admin")`.
- [ ] Decide one model:
- [ ] Single role: remove `[Flags]` and treat as a single enum value.
- [ ] Multi-role: emit multiple `ClaimTypes.Role` claims (one per role) and validate consistently.

## AuthZ / Permissions (Major Logic Bugs)

- [x] Organizer can be blocked from managing their own event:
- [x] Updated `Backend/EventosAPI.API/Controllers/v1/EventsController.cs` to use `ValidateEventAccess(...)` (organizer bypass) consistently.

- [ ] Event role checks are wrong if `EventRoleType` is treated as flags:
- [ ] Equality checks like `er.RoleType == roleType` exist in:
- [ ] `Backend/EventosAPI.Infrastructure/Repositories/EventRepository.cs`
- [ ] `Backend/EventosAPI.Infrastructure/Repositories/EventRoleRepository.cs`
- [ ] `Backend/EventosAPI.Infrastructure/Repositories/EventUserRoleRepository.cs`
- [ ] Decide storage model (one-row-per-flag vs bitmask) and make queries consistent.

- [ ] `EventRolesController` responses and deletes are incorrect:
- [ ] `Backend/EventosAPI.API/Controllers/v1/EventRolesController.cs` ignores `roleType` in `RemoveRole(...)`.
- [ ] After assignment it returns current user role, not target user role.
- [ ] Normalize endpoints to operate on `(eventId, targetUserId, roleType)` and return target user roles.

## API Contracts / Serialization (High Impact)

- [ ] DTO cycles currently force `ReferenceHandler.Preserve`:
- [ ] `TicketDto` includes `OrderDto`, and `OrderDto` includes `IEnumerable<TicketDto>`:
- [ ] `Backend/EventosAPI.Application/DTOs/TicketDtos.cs`
- [ ] `Backend/EventosAPI.Application/DTOs/OrderDtos.cs`
- [ ] `Backend/EventosAPI.API/Program.cs` sets `ReferenceHandler.Preserve`.
- [ ] Break cycles at DTO level (prefer summary DTOs / IDs) and remove `Preserve`.

- [ ] Consolidate `ApiResponse<T>` (currently duplicated):
- [ ] `Backend/EventosAPI.API/Controllers/ApiControllerBase.cs` defines an `ApiResponse<T>`.
- [ ] `Backend/EventosAPI.API/Models/ApiResponse.cs` defines another.
- [ ] Keep one, update controllers/middleware consistently.

- [ ] Pick one error handling approach:
- [ ] Exception-driven (recommended since you have `ErrorHandlingMiddleware`).
- [ ] Or explicit result/return objects.
- [ ] Today it’s mixed (manual `HandleError(...)` + exceptions).

## Configuration Problems

- [ ] Rate limiting config keys don’t match code:
- [ ] Code uses `RateLimiting:WindowSeconds` in `Backend/EventosAPI.API/Extensions/RateLimitingExtensions.cs`.
- [ ] Config uses `"Window": 60` in `Backend/EventosAPI.API/appsettings.json`.
- [ ] Align keys and naming.

- [ ] JWT expiry config mismatch:
- [ ] `Backend/EventosAPI.Infrastructure/Security/TokenService.cs` reads `Jwt:ExpiresInHours`.
- [ ] `Backend/EventosAPI.API/appsettings.Development.json` uses `Jwt:ExpiryInMinutes`.
- [ ] Standardize one key + unit.

- [ ] CORS config is defined but ignored:
- [ ] `Backend/EventosAPI.API/appsettings.json` has `"Cors": { "AllowedOrigins": [...] }`.
- [ ] `Backend/EventosAPI.API/Program.cs` hard-codes `WithOrigins("http://localhost:3000")`.
- [ ] Bind from configuration.

## Data Layer / EF Core / Repository Issues

- [ ] `BaseRepository.UpdateAsync` may not update detached entities:
- [ ] `Backend/EventosAPI.Infrastructure/Repositories/BaseRepository.cs` uses `Attach(entity)` but doesn’t mark modified.
- [ ] Decide expected update style (tracked-only vs detached-friendly) and implement clearly.

- [ ] `UserRepository.GetByEmailAsync` throws but app expects null sometimes:
- [ ] `Backend/EventosAPI.Infrastructure/Repositories/UserRepository.cs` throws `KeyNotFoundException`.
- [ ] `Backend/EventosAPI.Application/Services/UserService.cs` checks for `user == null` in `LoginAsync(...)`.
- [ ] Either return `User?` or throw an app exception that middleware maps cleanly.

- [ ] Define behavior for `MaxParticipants == 0`:
- [ ] `Backend/EventosAPI.Infrastructure/Repositories/EventRepository.cs` treats it as hard limit (0 => no tickets).
- [ ] Decide “unlimited” vs “no tickets” and enforce consistently.

## Domain Model Quality

- [ ] Fix batch stock/time-window inconsistency:
- [ ] `Backend/EventosAPI.Domain/Entities/Batch.cs` ignores stock for `TimeWindow` in multiple places.

- [ ] Revisit batch date validation relative to event dates:
- [ ] `Backend/EventosAPI.Domain/Entities/Batch.cs` currently rejects `StartDate < Event.EventDate` (often sales start before event).

- [ ] Fix mojibake (broken Portuguese strings) and ensure UTF-8:
- [ ] `Backend/EventosAPI.Infrastructure/Data/DatabaseSeeder.cs`, controllers, README, entities, etc.

## Application Layer (Service Design / Duplication / Consistency)

- [ ] Event roles are implemented in multiple places:
- [ ] `Backend/EventosAPI.Application/Services/EventService.cs` (role methods)
- [ ] `Backend/EventosAPI.Application/Services/EventRoleService.cs`
- [ ] Role logic mixed into `Backend/EventosAPI.Infrastructure/Repositories/EventRepository.cs`
- [ ] Consolidate into `EventRoleService` + `EventRoleRepository`.

- [ ] `GET /api/v1/users/me` will crash:
- [ ] `Backend/EventosAPI.Application/Services/UserService.cs` throws `NotImplementedException` in `GetCurrentUserAsync()`.
- [ ] Implement via `IHttpContextAccessor` or remove endpoint temporarily.

- [ ] Add transactionality to multi-step flows:
- [ ] `ReserveTicketsAsync` in `Backend/EventosAPI.Application/Services/TicketService.cs`
- [ ] `CreateOrderAsync` in `Backend/EventosAPI.Application/Services/OrderService.cs`

- [ ] Fix route param vs body param mismatch risk:
- [ ] `TicketsController.ValidateTicketPayment(...)` should set `validationDto.OrderId = orderId` and reject mismatches.

## Operational Concerns

- [ ] Avoid running migrations + seeding on every startup in non-dev:
- [ ] `Backend/EventosAPI.API/Program.cs` runs `MigrateAsync()` + `SeedAsync()` unconditionally.

- [ ] Fix security headers middleware behavior:
- [ ] `Backend/EventosAPI.API/Middleware/SecurityHeadersMiddleware.cs` sets HSTS redundantly/unconditionally.

## Repo Hygiene / Dead Files

- [ ] Add/verify `.gitignore` for:
- [ ] `.vs/`, `**/bin/`, `**/obj/`, `Backend/EventosAPI.API/Logs/`.

- [ ] Remove empty / placeholder files if truly unused:
- [ ] `Backend/EventosAPI.Application/DTOs/TicketPurchaseRequestDto.cs` (0 bytes)
- [ ] `Backend/EventosAPI.Infrastructure/Security/PasswordHasher.cs` (empty)
- [ ] `Backend/EventosAPI.Domain/Interfaces/Services/IBatchService.cs` (empty)
- [ ] `Backend/EventosAPI.Domain/Interfaces/Services/IEventRoleService.cs` (empty)
- [ ] `Backend/EventosAPI.Application/Class1.cs` (template leftover)

## Optimized Execution Path (Suggested)

1. [x] Lock down 2FA endpoints (`GoogleAuthController`) and remove email-driven setup flow.
2. [ ] Remove secrets from tracked config and move to env vars / user-secrets (Docker updated; docs still pending).
3. [x] Fix organizer/admin permission checks in `EventsController` using `ValidateEventAccess(...)`.
4. [ ] Decide + implement a consistent event-role model (storage + queries + controller behaviors).
5. [ ] Break DTO cycles, remove `ReferenceHandler.Preserve`, and stabilize response contracts.
6. [ ] Add transactions around reserve/purchase flows, fix route/body mismatch, and harden consistency.
7. [ ] Fix config mismatches (rate limiting, JWT expiry, CORS).
8. [ ] Repo hygiene cleanup + delete dead files + fix encoding/mojibake.
9. [ ] Dependency upgrades (AutoMapper vulnerability, other updates) and rebuild.
