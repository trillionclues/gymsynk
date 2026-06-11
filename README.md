<div align="center">

# GymSynk

**Self-hosted gym management — QR check-in, member tracking, and real-time cashier tooling.**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

[Deploy in 5 minutes](#quick-start) · [Documentation](./gymsynk-docs/) · [Contributing](./CONTRIBUTING.md)

</div>

---

## What is GymSynk?

Most small gyms run on institutional memory. The cashier knows which members are on weekly or monthly plans. She manually verifies attendance from her head. That works until she's absent — and then nothing works.

GymSynk replaces that with a structured digital system that doesn't take away the cashier's control. She still runs the desk. The system gives her the tools to do it with precision, a full audit trail, and data the gym owner can actually act on.

**It is not a SaaS product.** It's infrastructure you deploy on your own server, own completely, and can extend under AGPL-3.0. No per-seat pricing. No vendor lock-in. No cloud dependency. Single-command deploy.

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

### Cashier Portal
- **Live check-in feed** — real-time WebSocket stream of every scan, with member avatar, plan badge, session, and status
- **Member registration** — multi-step form with plan assignment and payment logging
- **Member search** — by name, phone, or member number (GS-XXXXX), debounced, paginated
- **QR scanner station** — full-screen camera view for tablet mounting at the gym entrance
- **Manual check-in** — for members without their phone; includes override flow for expired plans
- **Expiry alerts** — members expiring within 7 days shown in a sidebar panel

### Admin Dashboard
- **Attendance heatmap** — 7×24 hour/day-of-week grid showing peak times
- **Revenue analytics** — daily/monthly charts broken down by plan type
- **Member retention** — renewal rates and churn by plan
- **Staff management** — invite/deactivate cashiers
- **Full audit log** — every mutation with actor, IP, before/after diff, filterable and paginated
- **CSV export** — members, check-ins, payments — filterable by date range

### Member PWA
- **Installable** — Add to home screen on Android and iOS, works like a native app
- **OTP login** — email address + 6-digit code, no password to remember
- **QR check-in** — tap to generate, 120s countdown, single-use
- **Offline fallback** — static member card from service worker cache when no signal
- **Check-in history** — paginated, grouped by date with session and status
- **Renewal CTA** — shown 5 days before expiry

### Infrastructure
- **Single-command deploy** — `./setup-cli.sh` generates secrets, writes `.env`, starts containers, opens setup wizard
- **Auto-TLS** — Traefik v3 handles Let's Encrypt cert provisioning automatically
- **No file storage** — avatars are DiceBear-generated from name initials; PDF receipts streamed on-demand, never stored
- **Offline sync** — cashier portal queues check-ins in IndexedDB when offline, Background Sync API flushes them on reconnect
- **Multi-location schema** — organizations → locations hierarchy from day 1, costs nothing on single-gym installs

---

## Tech Stack

| Layer | Technology | Version |
|:------|:-----------|:--------|
| API | Spring Boot + Java 21 | 3.4 / 21 LTS |
| Database | PostgreSQL | 16 |
| Cache / pub-sub | Redis | 7 |
| Frontend | Next.js (App Router) | 15 |
| Styling | Tailwind CSS + shadcn/ui | current |
| PWA | Serwist | current |
| QR generation | ZXing (backend) | current |
| QR scanning | @zxing/browser (frontend) | current |
| Real-time | Spring WebSocket (STOMP) | built-in |
| Auth | Spring Security + JWT | 6.x |
| Avatars | DiceBear | current |
| PDF receipts | iText Community (AGPL) | current |
| Reverse proxy | Traefik | v3 |
| ORM / migrations | Hibernate 6 + Flyway | current |
| Build (backend) | Gradle Kotlin DSL | 8.x |
| Build (frontend) | pnpm | current |

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

The script prompts for your domain, ACME email, SMTP credentials, and payment mode. It auto-generates all secrets and starts the stack. When containers are healthy, it opens your browser to the setup wizard.

### Setup Wizard

Complete the 6-step wizard in your browser:

1. **Gym details** — name, timezone, currency (avatar auto-generated from name)
2. **Location** — branch name and address
3. **Operating hours** — morning/evening session times per day
4. **Payment mode** — Cash Only, Track & Receipt, or Full Processing (gateway)
5. **Membership plans** — edit the pre-filled Daily / Weekly / Monthly templates
6. **Admin account** — your email and password

After step 6 the wizard is permanently disabled and you're redirected to the cashier login.

---

## Membership Plans

Plans are fully configurable per location — nothing is hardcoded. Reference defaults:

| Plan | Duration | Valid Days | Sessions | Default Price |
|:-----|:---------|:-----------|:---------|:--------------|
| Daily | 1 day | Any | 1 (AM or PM) | ₦5,000 |
| Weekly | 7 days | Fri, Sat, Sun | AM + PM all 3 | ₦10,000 |
| Monthly | 28 days | All days | Unlimited AM + PM | ₦20,000 |
| Custom | Admin-defined | Admin-defined | Admin-defined | Admin-defined |

Currency defaults to NGN, configurable per organization during setup (ISO 4217).

---

## Payment Modes

Three modes, swappable from admin settings at any time. Backed by a Strategy Pattern — changing mode requires zero code changes.

| Mode | What it does |
|:-----|:------------|
| `CASH_ONLY` | Cashier logs amount and method manually. No receipt, no external call. |
| `TRACK_AND_RECEIPT` | Logs payment + generates PDF receipt via iText on-demand. Streamed as HTTP response, never stored. Emailed to member if email on file. |
| `FULL_PROCESSING` | Paystack or Flutterwave gateway. Returns payment link or cashier-initiated charge. Webhook confirms, activates membership. |

---

## Roles

| Role | Who | What they can do |
|:-----|:----|:-----------------|
| `ADMIN` | Gym owner / manager | Full access — config, plans, analytics, staff, audit log |
| `CASHIER` | Front desk | Register members, check-in, log payments — no config or financials |
| `MEMBER` | Gym attendee | Own profile, QR check-in, check-in history |

Role enforcement is at the service layer via Spring Security `@PreAuthorize` — not just the UI. A `FLOOR_STAFF` role (scan/check-in only) is on the v1.5 roadmap with schema support from day 1.

---

## Project Structure

```
gymsynk/
├── backend/                 Spring Boot 3.4 + Java 21
│   ├── build.gradle.kts
│   ├── Dockerfile
│   └── src/main/
│       ├── java/com/gymsynk/
│       └── resources/
│           ├── application.yml
│           └── db/migration/    Flyway V1–V10
├── frontend/                Next.js 15 + Serwist PWA
│   ├── package.json
│   ├── next.config.ts
│   └── src/app/
│       ├── dashboard/       Cashier + admin portal
│       ├── member/          Member PWA
│       └── setup/           First-run wizard
├── docker-compose.yml       Production stack (Traefik + API + web + DB + Redis)
├── docker-compose.dev.yml   Dev environment (DB + Redis only)
├── .env.example             Environment variable template
├── setup-cli.sh             Interactive first-run setup script
└── gymsynk-docs/            Architecture, design, and workflow documentation
```

---

## Environment Variables

Copy `.env.example` to `.env` — `setup-cli.sh` handles this automatically.

| Variable | Required | Description |
|:---------|:---------|:------------|
| `DOMAIN` | Yes | Your gym's domain |
| `ACME_EMAIL` | Yes | Let's Encrypt cert email |
| `POSTGRES_PASSWORD` | Yes | Auto-generated by setup script |
| `REDIS_PASSWORD` | Yes | Auto-generated by setup script |
| `JWT_SECRET` | Yes | 32-byte hex, auto-generated |
| `PAYMENT_MODE` | Yes | `CASH_ONLY` \| `TRACK_AND_RECEIPT` \| `FULL_PROCESSING` |
| `PAYSTACK_SECRET_KEY` | Conditional | Required if `FULL_PROCESSING` |
| `FLUTTERWAVE_SECRET_KEY` | Conditional | Alternative to Paystack |
| `SMTP_HOST` | Optional | Defaults to `smtp.resend.com` |
| `SMTP_PASSWORD` | Optional | Resend API key or SMTP password |
| `SMTP_FROM` | Optional | Verified sender address |

No `STORAGE_PATH`. No `SMS_*` variables. No file storage of any kind.

---

## Performance Targets

| Metric | Target |
|:-------|:-------|
| QR check-in validation | < 200ms p99 |
| WebSocket check-in update | < 1s to cashier screen |
| Member search | < 300ms |
| Dashboard first paint | < 2s |
| Concurrent check-ins | 50+ simultaneous |

Java 21 virtual threads handle I/O-bound check-in bursts without thread pool exhaustion. The entire stack runs comfortably on a 1 vCPU / 2 GiB VPS.

---

## Documentation

| Document | Description |
|:---------|:------------|
| [PRD](./gymsynk-docs/GymSynk_PRD.md) | Product requirements and feature spec |
| [System Design](./gymsynk-docs/GymSynk_System_Design.md) | Architecture, data model, QR engine, auth |
| [Implementation Guide](./gymsynk-docs/GymSynk_Implementation_Guide.md) | Phase-by-phase build plan |
| [Workflow Guide](./gymsynk-docs/GymSynk_Workflow_Guide.md) | Operational workflows for staff, members, admin |
| [Deployment Guide](./gymsynk-docs/GymSynk_Deployment_Guide.md) | VPS deploy, env vars, backups, monitoring |
| [Contributing Guide](./gymsynk-docs/GymSynk_Contributing_Guide.md) | Local dev, test commands, code standards |

---

## Roadmap

| Feature | Phase | Status |
|:--------|:------|:-------|
| Core check-in + cashier portal | v1.0 | In spec |
| Member PWA + QR flow | v1.0 | In spec |
| Three payment modes | v1.0 | In spec |
| Admin analytics dashboard | v1.0 | In spec |
| Offline sync (IndexedDB + Background Sync) | v1.0 | In spec |
| FLOOR_STAFF role | v1.5 | Planned — schema ready |
| Push notifications (plan expiry) | v1.5 | Planned |
| Membership freeze/pause | v1.5 | Planned |
| Multi-location management UI | v2.0 | Schema ready — UI deferred |
| Class/session booking | v2.0 | Separate product surface |
| SMS OTP (Termii/Twilio) | v1.5 | Planned — email only in v1 |
| K8s Helm charts | v2.0 | Docker Compose is primary target |

---

## License

GymSynk is licensed under **GNU AGPL-3.0**.

| What you can do | License requirement |
|:----------------|:-------------------|
| Self-host for your gym | None — just use it |
| Modify the source for your gym | None — private modification is fine |
| Host GymSynk as a service for others | Must publish your full modified source under AGPL |
| Fork and redistribute | Must keep AGPL and publish source |
| Contribute features back | Welcomed and credited |

There is no premium tier. Every feature is open source.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local dev setup, code standards, branch conventions, and how to run the test suite.

Security vulnerabilities: email `security@gymsynk.dev`. Do not open a public issue.
