# Changelog

All notable changes to GymSynk are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

Everything currently in active development toward the v1.0.0 release.
See [ROADMAP.md](./ROADMAP.md) for the full v1.0 scope.

### Added
- Project scaffolding: Spring Boot 3.4 + Java 21 + Next.js 15 monorepo
- Database schema: 10-table multi-org, multi-location PostgreSQL schema with Flyway migrations (V1–V10)
- Docker Compose production stack: Traefik v3 (auto-TLS), API, web, Postgres 16, Redis 7
- Dev Compose: Postgres + Redis only, no app containers
- `.env.example` with all supported environment variables
- `setup-cli.sh`: interactive first-run script, generates secrets, writes `.env`, starts stack, polls health, opens browser to setup wizard
- Design system: CSS token system (light + dark mode)

---

## [0.1.0] — Pre-release

_Not yet tagged. This entry will be finalized at first public release._

<!-- Template for future releases:

## [1.0.0] — YYYY-MM-DD

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

---

## Versioning Policy

- **Patch** (`1.0.x`) — bug fixes, security patches, documentation corrections. No API or schema changes.
- **Minor** (`1.x.0`) — new features, additive API changes, additive schema migrations. Backwards compatible. No operator action required beyond `docker compose up -d --build`.
- **Major** (`x.0.0`) — breaking changes: schema column drops/renames, API breaking changes, config key renames. Explicit operator migration instructions provided in the release notes and `CHANGELOG.md`.

Flyway migrations are **always additive within a minor version**. Breaking schema changes are gated behind major version bumps.
