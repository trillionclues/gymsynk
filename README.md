<div align="center">

# GymSynk

**Self-hosted gym management — QR check-in, member tracking, and real-time cashier tooling.**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Kotlin](https://img.shields.io/badge/Kotlin-1.9-purple.svg)](https://kotlinlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

[Deploy in 5 minutes](#quick-start) · [Contributing](./CONTRIBUTING.md)

</div>

---

## Why GymSynk?

Most small gyms run on institutional memory where the cashier has to know which members are on weekly or monthly plans by manually verifies attendance from their head. That works until they're absent — and then nothing works.

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
- **Member registration**: multi-step form with plan assignment and payment logging
- **QR scanner station**: full-screen camera view for tablet mounting at gym entrance
- **Manual check-in**: for non-scannable situations; includes override flow for expired plans
- **Expiry alerts**: track members expiring within 7 days
- **Attendance heatmap & Revenue analytics**: track peak times and charts by plan type
- **Full audit log & Staff management** :invite/deactivate cashiers
- **CSV export**: members, check-ins, payments filterable by date range

### Member PWA
- **Installable**: Add to home screen on Android and iOS, just like a native app
- **OTP login**: email address + 6-digit code, no password to remember
- **QR check-in**: tap to generate, 120s countdown, single-use
- **Offline fallback & Renewal CTA** — static member card  when no signal & 5days AOT renewal CTA
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

1. **Gym details**: name, timezone, currency (avatar auto-generated from name)
2. **Location**: branch name and address
3. **Operating hours**: morning/evening session times per day
4. **Payment mode**: Cash Only (`CASH_ONLY`), Track and Receipt (`TRACK_AND_RECEIPT`), or Full Processing (`FULL_PROCESSING`)
5. **Membership plans**: edit the pre-filled Daily / Weekly / Monthly templates
6. **Admin account**: your email and password

After step 6 the wizard is permanently disabled and you're redirected to the cashier login.

---

## Roles

| Role | Who | What they can do |
|:-----|:----|:-----------------|
| `ADMIN` | Gym owner / manager | Full access — config, plans, analytics, staff, audit log |
| `CASHIER` | Front desk | Register members, check-in, log payments — no config or financials |
| `MEMBER` | Gym attendee | Own profile, QR check-in, check-in history |

---

## Performance Targets

| Metric | Target |
|:-------|:-------|
| QR check-in validation | < 200ms p99 |
| WebSocket check-in update | < 1s to cashier screen |
| Member search | < 300ms |
| Dashboard first paint | < 2s |
| Concurrent check-ins | 50+ simultaneous |

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

API on `:8080` · Frontend on `:3000` · Swagger UI at `http://localhost:8080/api/v1/swagger-ui.html`

Seed credentials: `admin@gymsynk.com` / `password` and `cashier@gymsynk.com` / `password`

---

## Roadmap & Changelog

See [ROADMAP.md](./ROADMAP.md) for what's planned and [CHANGELOG.md](./CHANGELOG.md) for what's shipped.

---

## License

GymSynk is licensed under **GNU AGPL-3.0**.

There is no premium tier. Every feature is open source.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local dev setup, code standards, branch conventions, and how to run the test suite.

Security vulnerabilities: email `security@gymsynk.dev`. Do not open a public issue.
