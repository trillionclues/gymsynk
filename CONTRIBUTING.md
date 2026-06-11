# Contributing to GymSynk

GymSynk is open source under AGPL-3.0. Contributions are welcomed and credited. This document covers everything you need to go from zero to a working local dev environment and open a pull request.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [License](#license)
- [Local Development Setup](#local-development-setup)
- [Running Tests](#running-tests)
- [Code Standards](#code-standards)
- [Branch and PR Conventions](#branch-and-pr-conventions)
- [Database Migrations](#database-migrations)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

Be direct and respectful. Critique ideas, not people. If you disagree with a design decision, open an issue and make the case — every decision in the codebase has a reason documented in `gymsynk-docs/`, and changing one requires addressing that reasoning.

---

## License

GymSynk is AGPL-3.0. By contributing, you agree your contributions are licensed under the same terms. There is no CLA. If your employer has IP policies that could affect contributions, clarify that before opening a PR.

---

## Local Development Setup

### Prerequisites

| Tool | Version | Install |
|:-----|:--------|:--------|
| Java | 21 LTS | [SDKMAN](https://sdkman.io): `sdk install java 21-tem` |
| Node.js | 20+ | [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) |
| pnpm | latest | `npm install -g pnpm` |
| Docker | 24.x+ | [Docker Desktop](https://www.docker.com/products/docker-desktop/) or `apt install docker.io` |
| Docker Compose | v2+ | Bundled with modern Docker |

### 1. Start the dev database and Redis

```bash
# From the project root
docker compose -f docker-compose.dev.yml up -d

# Verify both containers are healthy
docker compose -f docker-compose.dev.yml ps
```

This spins up `postgres:16-alpine` and `redis:7-alpine` on their default ports. No app containers in dev — you run those locally.

### 2. Start the backend

```bash
cd backend

./gradlew bootRun --args='--spring.profiles.active=dev'
```

On first run, Flyway applies all migrations (V1–V10) and the `DataSeeder` populates:

- Org: **GymSynk Demo**
- 1 location
- Admin: `admin@gymsynk.com` / `password`
- Cashier: `cashier@gymsynk.com` / `password`
- 20 member users with varied plan states (active, expired, expiring soon)

The API is available at `http://localhost:8080`.  
Swagger UI: `http://localhost:8080/api/v1/swagger-ui.html`  
Health: `http://localhost:8080/api/v1/actuator/health`

### 3. Start the frontend

```bash
cd frontend

pnpm install

# Copy and configure local env
cp .env.local.example .env.local
# Set: NEXT_PUBLIC_API_URL=http://localhost:8080

pnpm dev
```

Frontend available at `http://localhost:3000`.

---

## Running Tests

### Backend

```bash
cd backend

# Unit tests (no Docker required)
./gradlew test

# Integration tests (requires Docker — Testcontainers spins up real Postgres + Redis)
./gradlew integrationTest

# All tests
./gradlew check
```

Integration tests use Testcontainers. They spin up isolated containers per test class — no shared state, no mocking of DB or Redis. Key test suites:

| Test | What it covers |
|:-----|:--------------|
| `CheckInServiceIntegrationTest` | Full 10-step check-in pipeline, concurrent scan race condition |
| `AuthServiceTest` | Staff login, OTP email flow, refresh token lifecycle |
| `MembershipExpirySchedulerTest` | Expiry detection and email trigger |
| `PaymentStrategyTest` | All three payment strategy modes |
| `QrTokenServiceTest` | Token generation, Redis TTL, single-use GETDEL guarantee |

### Frontend

```bash
cd frontend

# Component tests (Vitest + React Testing Library)
pnpm test

# Run once without watch mode
pnpm test --run

# E2E with Playwright (requires backend running on :8080)
pnpm exec playwright test

# E2E in interactive UI mode
pnpm exec playwright test --ui
```

---

## Code Standards

### Backend (Java 21 / Spring Boot 3.4)

**Package structure** — domain-driven. Each feature is self-contained: controller, service, repository, entity, DTOs all live under the same package (e.g. `com.gymsynk.checkin`). No cross-package entity references. Services communicate via interfaces and DTOs only.

**DTOs** — use Java 21 records for all request/response objects.

```java
// Good
public record MemberRegistrationRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @Email String email,
    String phone,
    @NotNull UUID planId
) {}
```

**Authorization** — `@PreAuthorize` at the service layer, not just controllers. Role checks must be enforced where the business logic lives.

```java
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
public MemberResponse registerMember(MemberRegistrationRequest request) { ... }
```

**Transactions** — `@Transactional` on service methods, not controller methods.

**Audit trail** — use the `@Auditable` AOP aspect on any service method that mutates data. Every write action must appear in `audit_log` with actor ID and IP.

**Money** — always `DECIMAL(12,4)`, never `float` or `double`. Use `BigDecimal` in Java.

**Timezone** — always use `ZoneId.of(org.timezone)` for any time computation. No implicit UTC assumptions.

**No hardcoded config** — every configurable value goes in `application.yml` or environment variables. No magic strings in business logic.

**Flyway** — migrations are additive within a minor version. Never drop or rename an existing column without a major version bump. See [Database Migrations](#database-migrations).

### Frontend (Next.js 15 / TypeScript)

**TypeScript** — strict mode. No `any`. Use generated API types.

**Forms** — all forms use `react-hook-form` + Zod schemas for validation. No ad-hoc validation logic in components.

**Server vs client components** — Server Components by default. Only add `'use client'` when interactivity (hooks, browser APIs) is actually needed. Do not client-side render entire pages to use one stateful widget.

**State** — Zustand stores for cross-component state. No prop drilling. No Context for performance-sensitive data.

**API calls** — always via `lib/api.ts` (the axios instance with JWT interceptor). Never call `fetch` directly in components.

**Camera / QR scanner** — must be dynamically imported with `ssr: false`. ZXing uses browser APIs that crash on server render.

```tsx
const QrScanner = dynamic(
  () => import('@/components/checkin/QrScanner'),
  { ssr: false }
);
```

**Accessibility** — use shadcn/ui primitives. Every interactive element needs a visible focus ring and appropriate `aria-*` label. Keyboard navigation must work.

**Avatar generation** — use DiceBear `initials` style seeded from the user's name. No file uploads, no `<img src>` pointing to uploaded files.

```tsx
import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';

const svg = createAvatar(initials, {
  seed: `${member.firstName} ${member.lastName}`,
}).toString();
```

---

## Branch and PR Conventions

### Branch naming

```
main                    Production-ready only — never commit directly
dev                     Integration branch for all feature work
feature/{name}          New features (e.g. feature/expiry-scheduler)
fix/{name}              Bug fixes (e.g. fix/qr-token-race)
docs/{name}             Documentation-only changes
chore/{name}            Build, deps, tooling (e.g. chore/upgrade-spring-boot)
```

All PRs target `dev`. `dev` is merged to `main` for releases.

### PR checklist

- [ ] All tests pass locally (`./gradlew check` + `pnpm test --run`)
- [ ] No new lint warnings introduced
- [ ] New endpoints have `@PreAuthorize` at service layer
- [ ] New mutations have `@Auditable` aspect applied
- [ ] Schema changes have a new Flyway migration (never edit applied migrations)
- [ ] Breaking changes (API shape, schema) called out explicitly in PR description
- [ ] Relevant docs updated if a design decision changed

### PR description format

```
## What
Brief description of the change.

## Why
What problem this solves or what requirement it implements.

## How to test
Steps to verify the change works, including any seed data or env vars needed.

## Breaking changes
List any breaking API or schema changes, or write "None".
```

---

## Database Migrations

Flyway manages all schema changes. Rules:

- **Never edit an applied migration.** Create a new `V{N}__description.sql` instead.
- **Migrations are additive within a minor version.** No column drops, no renames, no table drops.
- **Breaking migrations are gated behind major version bumps** with explicit operator notes in `CHANGELOG.md`.
- Migration files live in `backend/src/main/resources/db/migration/`.

Naming convention:

```
V1__create_organizations.sql
V2__create_locations.sql
...
V10__create_audit_log.sql
V11__add_member_notes_index.sql     ← your new migration
```

When writing a migration:

1. Always test it against a fresh schema: `docker compose -f docker-compose.dev.yml down -v && docker compose -f docker-compose.dev.yml up -d`, then `./gradlew bootRun`
2. Include a comment at the top of the file explaining what and why
3. For index additions, use `CREATE INDEX CONCURRENTLY` to avoid table locks in production (Flyway supports this in Postgres)

---

## Reporting Issues

Open a GitHub issue and include:

- GymSynk version (from `CHANGELOG.md` or `docker inspect gymsynk/api | grep -i version`)
- VPS specs and OS (`uname -a`, `free -h`, `df -h`)
- Steps to reproduce the issue
- Relevant logs: `docker compose logs api --tail=100 2>&1`
- Whether it's a regression (worked in a prior version)

**Security vulnerabilities** — email `security@gymsynk.dev`. Do not open a public GitHub issue for security reports.

---

## Questions

Open a GitHub Discussion for design questions, architecture feedback, or anything that isn't a bug or feature request. Issues are for actionable items; Discussions are for everything else.
