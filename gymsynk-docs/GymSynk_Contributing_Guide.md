**GymSynk**

_Open-Source Gym Management Platform_

Licensed under AGPL-3.0

**Contributing Guide**

How to Contribute to GymSynk

Version 1.0.0

---

# 1. License

GymSynk is licensed under **GNU AGPL-3.0**.

This means:
- You can freely use, modify, and distribute GymSynk
- If you deploy GymSynk (or a fork) as a network service for others, you **must** publish your full modified source under AGPL
- Private modifications for your own gym do not require publication
- PRs and contributions are welcomed and credited

There is no premium tier. Every feature is open source.

---

# 2. Project Structure

```
gymsynk/
├── backend/          Spring Boot 3.4 + Java 21
├── frontend/         Next.js 15 + Serwist PWA
├── docker-compose.yml           Production Compose (Traefik + all services)
├── docker-compose.dev.yml       Dev Compose (DB + Redis only)
├── .env.example                 Environment variable template
├── setup-cli.sh                 Interactive first-run setup script
├── gymsynk-docs/                Design and architecture documentation
└── README.md
```

---

# 3. Local Development Setup

## Prerequisites

- Java 21 (via SDKMAN or homebrew: `sdk install java 21-tem`)
- Node.js 20+ and pnpm (`npm install -g pnpm`)
- Docker + Docker Compose v2
- (Optional) IntelliJ IDEA or VS Code

## Start Dev Environment

```bash
# Start PostgreSQL + Redis only (no app containers)
docker compose -f docker-compose.dev.yml up -d

# Verify containers are healthy
docker compose -f docker-compose.dev.yml ps
```

## Start Backend

```bash
cd backend

# First run: Flyway migrations run automatically on startup
./gradlew bootRun --args='--spring.profiles.active=dev'

# API available at http://localhost:8080
# Swagger UI at http://localhost:8080/api/v1/swagger-ui.html
# Health: http://localhost:8080/api/v1/actuator/health
```

The `dev` profile loads `application-dev.yml` which points to the local Docker DB and Redis. The `DataSeeder` component runs on startup and creates:
- Org: **GymSynk Demo**
- 1 location
- 1 ADMIN user: `admin@gymsynk.com` / `password`
- 1 CASHIER user: `cashier@gymsynk.com` / `password`
- 20 MEMBER users with varied plan states (active, expired, expiring-soon)

## Start Frontend

```bash
cd frontend

pnpm install

# Set env vars for local dev
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8080

pnpm dev

# Frontend available at http://localhost:3000
```

---

# 4. Running Tests

## Backend Unit + Integration Tests

```bash
cd backend

# Unit tests only (no Docker required)
./gradlew test

# Integration tests (requires Docker for Testcontainers)
./gradlew integrationTest
```

Integration tests use Testcontainers to spin up real PostgreSQL 16 and Redis 7 containers. No mocking of DB or Redis.

Key test suites:
- `CheckInServiceIntegrationTest` — full 10-step pipeline including concurrent scan race condition
- `AuthServiceTest` — staff login, OTP email flow, refresh token lifecycle
- `MembershipExpirySchedulerTest` — expiry detection and email trigger
- `PaymentStrategyTest` — all three strategy modes

## Frontend Tests

```bash
cd frontend

# Component tests (Vitest + React Testing Library)
pnpm test

# E2E (Playwright — requires backend running)
pnpm exec playwright test

# E2E in UI mode
pnpm exec playwright test --ui
```

---

# 5. Code Standards

## Backend (Java 21 / Spring Boot)

- **Domain-driven packages** — each feature is self-contained (`auth/`, `member/`, `checkin/`, etc.)
- **No cross-package entity references** — services communicate via interfaces and DTOs only
- **Record-based DTOs** — use Java 21 records for all request/response objects
- **@PreAuthorize at service layer** — not just controller; role checks in service methods
- **@Transactional on service methods** — not controller methods
- **Audit every mutation** — use the `@Auditable` AOP aspect on service methods that mutate data
- **No hardcoded config** — all configurable values come from `application.yml` or env vars
- **Flyway migrations are additive** — never drop or rename columns within a minor version

```java
// Good: record DTO
public record MemberRegistrationRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @Email String email,
    String phone,
    @NotNull UUID planId
) {}

// Good: service-level authorization
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
public MemberResponse registerMember(MemberRegistrationRequest request) { ... }
```

## Frontend (Next.js 15 / TypeScript)

- **Strict TypeScript** — no `any`, use generated API types
- **Zod for form validation** — all forms use react-hook-form + Zod schemas
- **Server Components by default** — only use `'use client'` when interactivity is needed
- **No prop drilling** — use Zustand stores for cross-component state
- **Accessible components** — use shadcn/ui primitives; all interactive elements need `aria-*` labels
- **Dynamic import for camera** — `@zxing/browser` and QR scanner components must be dynamically imported (`ssr: false`)
- **API calls via `lib/api.ts`** — never call `fetch` directly in components

```tsx
// Good: dynamic import for camera components
const QrScanner = dynamic(
  () => import('@/components/checkin/QrScanner'),
  { ssr: false }
);
```

---

# 6. Branch and PR Conventions

```
main              Production-ready code only
dev               Integration branch for feature work
feature/{name}    Feature branches (e.g. feature/expiry-scheduler)
fix/{name}        Bug fixes (e.g. fix/qr-token-race-condition)
docs/{name}       Documentation updates
```

**PR requirements:**
- All tests passing (CI runs `./gradlew test` + `pnpm test`)
- No new lint warnings
- Description includes: what changed, why, how to test
- Breaking changes (schema changes, API changes) noted explicitly in PR description

---

# 7. Database Migrations

Flyway manages all schema changes. Rules:
- **Never edit an applied migration** — create a new `V{N}__description.sql`
- **Migrations are always additive within a minor version** — no column drops, no renames
- **Breaking migrations** are gated behind major version bumps with explicit operator notes in CHANGELOG.md
- New migrations go in `backend/src/main/resources/db/migration/`

Naming convention:
```
V1__create_organizations.sql
V2__create_locations.sql
...
V10__create_audit_log.sql
V11__add_member_number_index.sql   ← new migrations start from V11
```

---

# 8. Avatar Generation

GymSynk uses **DiceBear** for all avatars. No file uploads, no storage.

- **Member avatars** — `initials` style, seeded from `${firstName} ${lastName}`
- **Gym logo** — `initials` style, seeded from org name

```tsx
// Usage in frontend components
import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';

const avatar = createAvatar(initials, {
  seed: `${member.firstName} ${member.lastName}`,
  backgroundColor: ['4F46E5', '7C3AED', '059669', 'DC2626'],
});

const avatarSvg = avatar.toString(); // inline SVG
```

---

# 9. Environment Variables

Copy `.env.example` to `.env` for production, `.env.local` for frontend dev.

See `GymSynk_Deployment_Guide.md` Section 3 for the full reference.

**Key points:**
- `STORAGE_PATH` does not exist — GymSynk has no file storage
- `SMS_*` variables do not exist in v1 — OTP is email-only
- `SMTP_HOST` defaults to `smtp.resend.com`; operators can override with any SMTP provider

---

# 10. Reporting Issues

Open a GitHub issue with:
- GymSynk version (from CHANGELOG.md or `docker inspect gymsynk/api`)
- VPS specs and OS
- Steps to reproduce
- Relevant logs: `docker compose logs api --tail=100`
- Whether it's a regression (worked in a prior version)

Security vulnerabilities: email `security@gymsynk.dev` (do not open a public issue).
