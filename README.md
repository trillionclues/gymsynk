<div align="center">

# GymSynk

**Self-hosted gym management with QR check-in, member tracking and real-time payments management.**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Kotlin](https://img.shields.io/badge/Kotlin-1.9-purple.svg)](https://kotlinlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

[Deploy in 5 minutes](#quick-start) · [Contributing](./CONTRIBUTING.md)

</div>

---

## Why GymSynk?

Most small gyms run on institutional memory where the cashier has to know which members are on weekly or monthly plans by manually verifies attendance from their head. That works until they're absent.

GymSynk replaces that with a structured digital system that doesn't take away cashier's control. The system gives them the tools to do it with precision, a full audit trail, and data the gym owner can actually act on.

---

## How it works

```
Member opens PWA → taps Check In → QR appears (120s)
         │
         ▼
Cashier scans QR with portal camera
         │
         ▼
API validates: membership active? session valid? day allowed?
         │
    ┌────┴────┐
  VALID     EXPIRED
    │           │
Check-in    Cashier sees alert
recorded    + override option
    │
    ▼
Live feed updates on cashier dashboard (WebSocket, < 1s)
```

QR tokens are opaque 64-char hex strings stored in Redis with a 120-second TTL. Single-use, atomically consumed via `GETDEL`. No PII in the QR image. Replayed tokens are useless.

---

## Features

### Cashier & Admin Portal

- **Live check-in feed**: real-time WebSocket stream of every scan
- **QR scanner station**: full-screen camera view for tablet mounting at gym entrance
- **Manual check-in**: for non-scannable situations; includes override flow for expired plans
- **Member registration**: multi-step form with plan assignment and payment logging
- **Plans management**: CRUD operations for membership plans, pricing, duration types, and allowed session rules (`/dashboard/plans`)
- **Staff management**: invite, assign roles, and deactivate cashier accounts (`/dashboard/staff`)
- **Payments log**: paginated transaction history with status filter chips (`/dashboard/payments`)
- **Analytics & 7×24 Heatmap**: interactive Recharts attendance area chart, revenue bar chart, and 7×24 peak density heatmap (`/dashboard/analytics`)
- **Audit log**: security activity log with expandable JSON payload diff viewer (`/dashboard/audit`)
- **OpenStreetMap geocoding**: real-time address lookup, GPS coordinate capture, and geofence boundary configuration
- **Unified gesture UI**: mobile-friendly `<BottomSheet>`, `<SheetSelect>`, and `<DateRangeSheetModal>` primitives
- **Role-based access control (RBAC)**: dynamic sidebar navigation filtering and read-only UI enforcement for cashiers

### Member PWA

- **Installable**: Add to home screen on Android and iOS, just like a native app
- **OTP login**: email address + 6-digit code, no password to remember
- **QR check-in**: tap to generate, 120s countdown, single-use
- **Offline fallback & Renewal CTA**: static member card when offline and 5-day advance renewal prompt

---

## Quick Start

### Prerequisites

- VPS with Ubuntu 22.04 / 24.04 (1 vCPU, 2 GiB RAM, 25 GiB disk minimum)
- Docker 24.x+ and Docker Compose v2+
- A domain with an A record pointing to the VPS IP
- Ports 80 and 443 open

### Deploy

```bash
git clone https://github.com/trillionclues/gymsynk.git
cd gymsynk
chmod +x setup-cli.sh
./setup-cli.sh
```

The script prompts for your domain, ACME email, SMTP credentials, and payment mode. It auto-generates all secrets and starts the stack. When containers are healthy, it opens browser to the setup wizard.

### Setup Wizard

Complete the 6-step wizard in your browser:

1. **Gym details**: name, timezone, searchable 160+ world currency picker (`<CurrencySheetModal>`)
2. **Location**: branch name, OpenStreetMap live geocoding (GPS latitude/longitude), and geofence radius selector
3. **Operating hours**: morning/evening session times per day
4. **Payment mode**: Cash Only (`CASH_ONLY`), Track and Receipt (`TRACK_AND_RECEIPT`), or Full Processing (`FULL_PROCESSING` with Paystack & LemonSqueezy credential unlocking)
5. **Membership plans**: edit the pre-filled Daily / Weekly / Monthly templates
6. **Admin account**: your name, email, and password

After step 6 the wizard is permanently disabled and you're redirected to the portal.

---

## Roles & Access Matrix

| Role      | Navigation & Permissions                                                                                                                                        |
| :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN`   | **Full Administrative Access**: Organization config, plans CRUD, staff invitation/deactivation, payments log, analytics dashboard, audit trail                  |
| `CASHIER` | **Operational Access**: Dashboard, scanner station, member registration, payments log, plans (read-only mode). Restricted from staff, analytics, and audit logs |
| `MEMBER`  | **PWA Access**: Personal profile, QR check-in generation, check-in history, active plan status                                                                  |

---

## Performance Targets

Kotlin virtual threads handle I/O-bound check-in bursts without thread pool exhaustion. The entire stack runs comfortably on a 1 vCPU / 2 GiB VPS.

---

## Local Development

**Prerequisites:** Java 21, Node.js 20+, pnpm, Docker + Compose v2.

```bash
# 1. Clone
git clone https://github.com/trillionclues/gymsynk.git
cd gymsynk

# 2. Install frontend dependencies (from repo root)
pnpm install

# 3. Start Postgres + Redis only
docker compose -f docker-compose.dev.yml up -d

# 4. Start the Kotlin API (seeds demo data on first run)
cd apps/api
./gradlew bootRun --args='--spring.profiles.active=dev'

# 5. In a separate terminal, start the Next.js frontend
cd ../..
pnpm dev:web
```

API on `:8080` · Frontend on `:3000`
Demo credentials

Admin: admin@gymsynk.com / password
Cashier: cashier@gymsynk.com / password
Member: member@gymsynk.com / OTP login

---

## Roadmap & Changelog

See [ROADMAP.md](./ROADMAP.md) for what's planned and [CHANGELOG.md](./CHANGELOG.md) for what's shipped.

---

## License

GymSynk is licensed under **GNU AGPL-3.0**.

There is no premium tier. Every feature is open source.
