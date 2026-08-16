# GymSynk Roadmap

This file tracks planned features and the thinking behind prioritization. It is not a commitment — scope may shift based on real-world usage and contributor interest.

For what has already shipped, see [CHANGELOG.md](./CHANGELOG.md).

---

## v1.0 — Core Platform _(in spec)_

The foundational release. Everything a gym needs to replace the "cashier knows everyone" model and run daily operations from day one. Deliberately scoped to the irreducible minimum — the features without which GymSynk is not useful at all.

**Member management**
- [ ] Member registration (cashier-side, multi-step form)
- [ ] Auto-generated member number (GS-XXXXX)
- [ ] DiceBear avatar from name initials — no file uploads
- [ ] Member search by name, phone, member number

**QR check-in engine**
- [ ] Opaque Redis token generation (64-char hex, 120s TTL)
- [ ] ZXing QR PNG generation (backend)
- [ ] @zxing/browser camera scanning (frontend)
- [ ] Full 10-step validation pipeline (org, membership, session, day, duplicate)
- [ ] Single-use atomic GETDEL guarantee
- [ ] Manual check-in with cashier override + reason
- [ ] WebSocket live check-in feed (STOMP, Redis pub/sub bridge)

**Membership plans**
- [ ] Configurable plan templates (Daily, Weekly, Monthly, Custom)
- [ ] Per-plan allowed days, sessions, max check-ins per day
- [ ] Auto-computed end dates from plan duration
- [ ] Membership expiry scheduler (hourly)
- [ ] 5-day expiry warning email (daily, org timezone)

**Payment system**
- [ ] CASH_ONLY mode — manual log, no receipt (the only payment mode in v1.0)
- [ ] Strategy pattern implemented — TRACK_AND_RECEIPT and FULL_PROCESSING plug in at v1.1 with no code changes to PaymentService

**Staff portal (cashier + admin)**
- [ ] Staff login (email + password, JWT, Redis refresh token)
- [ ] Live check-in dashboard with today stats strip
- [ ] Expiry alerts panel (7-day window)
- [ ] QR scanner station (full-screen, tablet-friendly, auto-reset)
- [ ] Member registration form + profile drawer + manual check-in

**Member PWA**
- [ ] OTP login (email, 6-digit code via Resend)
- [ ] Installable PWA (manifest, Serwist service worker)
- [ ] QR display with 120s countdown
- [ ] Offline fallback (static member card from cache)
- [ ] Check-in history (paginated, grouped by date)
- [ ] Renewal CTA at 5 days before expiry

**Infrastructure**
- [ ] First-run setup wizard (6-step, permanently disabled after completion)
- [ ] `setup-cli.sh` — secrets generation, env setup, Docker start, health poll
- [ ] Docker Compose production stack (Traefik auto-TLS, API, web, Postgres, Redis)
- [ ] Dev Compose (DB + Redis only)
- [ ] Multi-stage production Dockerfiles (backend + frontend)
- [ ] Testcontainers integration test suite
- [ ] Playwright E2E suite

---

## v1.1 — Operational Completeness _(planned)_

Features that make the system useful for gym owners who want financial records and operational visibility, but are not blockers for the core check-in workflow.

**Payment modes**
- [ ] TRACK_AND_RECEIPT mode — iText PDF receipt on-demand, streamed, emailed to member
- [ ] FULL_PROCESSING mode — LemonSqueezy (reference) / Paystack (NGN), gateway-hosted redirect, webhook confirmation

**Admin portal additions**
- [ ] Admin analytics: attendance heatmap, revenue charts, member retention
- [ ] Staff management: invite/deactivate cashiers
- [ ] Full audit log viewer (every mutation, actor, IP, before/after diff)
- [ ] CSV export (members, check-ins, payments)

**Offline resilience**
- [ ] Offline check-in sync (IndexedDB queue + Background Sync API)

---

## v1.5 — Operational Depth _(planned)_

Features that make day-to-day gym operations smoother, based on expected real-world friction.

**FLOOR_STAFF role**
- [ ] Scan/check-in only — no registration, no payments, no config
- [ ] Schema and permission enum already included from v1.0

**Member notifications**
- [ ] Web push notifications for plan expiry (service worker push)
- [ ] Push on successful check-in (optional, member can disable)

**Membership controls**
- [ ] Freeze/pause membership (paused days don't count against duration)
- [ ] Cancellation flow with audit trail

**Auth improvements**
- [ ] 2FA for admin accounts (TOTP — Google Authenticator compatible)
- [ ] SMS OTP delivery (Termii for NGN, Twilio fallback) — email-only in v1.0

**Developer experience**
- [ ] OpenAPI spec published to GitHub Pages on release
- [ ] Docker image published to GitHub Container Registry (ghcr.io)

---

## v2.0 — Scale and Extensibility _(planned)_

For gyms that have outgrown a single location or need deeper operational tooling.

**Multi-location UI**
- [ ] Location switcher in the cashier portal
- [ ] Per-location plan management
- [ ] Cross-location reporting in admin analytics
- [ ] Schema is multi-location from day 1 — this is a UI-only addition

**Class and session booking**
- [ ] Bookable class schedule (separate product surface from open check-in)
- [ ] Class capacity limits and waitlist
- [ ] Booking cancellation window

**Platform**
- [ ] Kubernetes Helm charts (Docker Compose remains the primary deploy target)
- [ ] Native mobile app wrapper (Capacitor or TWA — PWA covers v1/v1.5 use cases)
- [ ] Internationalization: Yoruba and French translations (English ships in v1.0)
- [ ] SMS-based member notifications

---

## Not Planned

Things that are intentionally out of scope for GymSynk.

| Feature | Reason |
|:--------|:-------|
| SaaS / shared-database multi-tenancy | Against the self-hosted philosophy. Each gym owns its own instance. |
| Premium / paid tier | Everything is AGPL. No feature gating. |
| Biometric check-in | Privacy and hardware complexity out of scope for v1. |
| POS hardware integration | Out of scope. Use FULL_PROCESSING mode for online payment. |
| Member-to-member social features | Not a social product. |

---

## Contributing to the Roadmap

If you want to work on something listed here, open a GitHub Discussion first to align on approach before writing code. For features not listed, open an issue with the use case and we'll figure out where it fits.

Prioritization is driven by: reported pain points from real gym operators, implementability within the self-hosted constraint, and AGPL compatibility.
