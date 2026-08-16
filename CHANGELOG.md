# Changelog

All notable changes to GymSynk are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

Active documentation and design work toward the v1.0.0 release.
See [ROADMAP.md](./ROADMAP.md) for the full v1.0 scope.

### Added
- Project documentation suite: PRD, System Design, Implementation Guide, Workflow Guide, Design System, Deployment Guide, Contributing Guide
- Database schema: 10-table multi-org, multi-location PostgreSQL design with Flyway migration order (V1–V10)
- Design system: minimal neutral token system (light + dark mode) — near-black primary, muted accent, desaturated status/plan/session colors
- Docker Compose production stack design: Traefik v3 (auto-TLS), API, web, Postgres 16, Redis 7
- Dev Compose design: Postgres + Redis only, no app containers
- `.env.example` with all supported environment variables
- `setup-cli.sh` spec: interactive first-run script — generates secrets, writes `.env`, starts stack, polls health, opens browser to setup wizard

### Changed
- MVP scope tightened: CASH_ONLY is the only payment mode in v1.0; TRACK_AND_RECEIPT and FULL_PROCESSING move to v1.1 (strategy interface still implemented from v1.0 so no code changes needed at v1.1)
- Admin analytics dashboard, staff management, audit log viewer, CSV export, and offline check-in sync (IndexedDB + Background Sync) moved to v1.1
- Gateway strategy clarified: LemonSqueezy is the reference implementation for FULL_PROCESSING; Paystack is the secondary implementation for NGN deployments. Flutterwave removed from scope. Gateway-hosted redirect only — no direct card entry through the portal.
- PWA theme color resolved to `#18181b` (near-black) — replaces the undecided `#4F46E5` placeholder
- OTP delivery confirmed as email-only in v1.0 (via Resend/SMTP); SMS (Termii/Twilio) is v1.5. Setup script no longer prompts for SMS credentials.
- `audit_log.action` enum clarified: `CHECK_IN_OVERRIDE` added as a distinct action type separate from `CHECK_IN` for independent filterability in the audit log UI
- Terminology standardised: `TRACK_AND_RECEIPT` used consistently across all docs (was `Track & Receipt` in some places). Flutterwave references removed.
- Backend language: Java 21 remains the documented default; Kotlin noted as a fully supported alternative — Spring Boot 3.4 has first-class Kotlin support and the package structure applies equally to either language.

---

## Versioning Policy

- **Patch** (`1.0.x`) — bug fixes, security patches, documentation corrections. No API or schema changes.
- **Minor** (`1.x.0`) — new features, additive API changes, additive schema migrations. Backwards compatible. No operator action required beyond `docker compose up -d --build`.
- **Major** (`x.0.0`) — breaking changes: schema column drops/renames, API breaking changes, config key renames. Explicit operator migration instructions provided in the release notes and `CHANGELOG.md`.

Flyway migrations are **always additive within a minor version**. Breaking schema changes are gated behind major version bumps.

<!-- Template for future releases:

## [1.1.0] — YYYY-MM-DD

### Added
-

### Changed
-

### Fixed
-

### Removed
-

### Security
-

-->
