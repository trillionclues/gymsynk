**GymSynk**

_Open-Source Gym Management Platform_

Licensed under AGPL-3.0

**System Architecture & Design Document**

Technical Reference for GymSynk v1.0

Version 1.0.0 | Internal Engineering Reference

Spring Boot 3.4 • Java 21 • Next.js 15 • PostgreSQL 16

Generated: 9 June 2026

# 1\. Architecture Overview

GymSynk uses a two-process, service-oriented architecture designed for single-command self-hosted deployment. The Spring Boot API and the Next.js web frontend are separate containers communicating over an internal Docker network, with PostgreSQL and Redis as backing services. Traefik handles TLS termination and reverse proxying. There is no file storage layer — member and gym avatars are generated client-side via DiceBear, and PDF receipts are streamed on-demand in memory.

**Architecture Principle**

Boring, operational tech. Spring Boot and Next.js are mature, well-documented, and trivially self-hostable. Java 21 virtual threads handle the I/O-bound check-in burst problem without Reactive programming complexity. Everything runs on a single 2-core VPS for most gyms - scale out only when the bottleneck is proven.

| **Layer**        | **Technology**            | **Version**     | **Rationale**                                                                   |
| ---------------- | ------------------------- | --------------- | ------------------------------------------------------------------------------- |
| API Server       | Spring Boot               | 3.4             | Virtual threads, mature ecosystem, strong Java portfolio signal                 |
| Language         | Java                      | 21 (LTS)        | Virtual threads (Project Loom), records for DTOs, pattern matching              |
| Database         | PostgreSQL                | 16              | JSONB for config, excellent indexing, proven at scale, ACID check-in writes     |
| ORM / Migrations | Hibernate 6 + Flyway      | current         | JPA for queries, Flyway for version-controlled schema migrations                |
| Cache / Queues   | Redis                     | 7               | QR token store (TTL), refresh token whitelist, WebSocket pub/sub, rate limiting |
| Auth             | Spring Security + JWT     | 6.x             | Stateless JWT + Redis refresh token whitelist for revocation                    |
| QR Generation    | ZXing (backend)           | current         | Industry standard, generates PNG QR from opaque token string                    |
| QR Scanning      | @zxing/browser (frontend) | current         | Client-side camera API, works offline for display                               |
| Real-time        | Spring WebSocket (STOMP)  | built-in        | Cashier dashboard live feed - bidirectional, Spring-native                      |
| Frontend         | Next.js                   | 15 (App Router) | SSR for fast first paint on slow connections, PWA via Serwist                   |
| Styling          | Tailwind CSS + shadcn/ui  | current         | Rapid UI, accessible primitives, no design system from scratch                  |
| Avatar           | DiceBear                  | current         | Auto-generated member and gym avatars from name initials — no file uploads      |
| PWA              | Serwist                   | current         | Service worker, offline caching, Background Sync, install prompt                |
| File Storage     | None                      | N/A             | No file storage layer. No uploads. No MinIO. Avatars are client-side generated. PDF receipts are streamed on-demand, never stored. |
| Reverse Proxy    | Traefik                   | v3              | Standalone auto TLS via ACME, Docker label routing, zero-downtime deploys       |
| Build (backend)  | Gradle (Kotlin DSL)       | 8.x             | Faster than Maven, modern DSL, better dependency management                     |
| Build (frontend) | pnpm + Turborepo          | current         | Fast installs, workspace support if monorepo grows                              |

# 2\. System Components

## 2.1 Spring Boot API - Package Structure

Domain-driven package structure. Each feature is a self-contained module: controller, service, repository, entity, and DTOs. No cross-package entity references - services communicate via interfaces and DTOs only.

com.gymsynk/

├── GymSynkApplication.java

├── config/ SecurityConfig, WebSocketConfig, RedisConfig, OpenApiConfig, CorsConfig

├── common/

│ ├── exception/ GlobalExceptionHandler, BusinessException, ErrorCodes

│ ├── audit/ AuditService, @Auditable AOP aspect

│ └── util/ QrCodeGenerator, ReceiptGenerator, PaginationUtils

├── auth/ AuthController, AuthService, JwtService, JwtAuthFilter

│ entities: RefreshToken dto: LoginRequest, TokenResponse

├── organization/ OrganizationController, OrganizationService, SetupService

│ entity: Organization dto: SetupRequest, OrgResponse

├── location/ LocationController, LocationService

│ entities: Location, OperatingHours

├── member/ MemberController, MemberService

│ entity: User (role: ADMIN|CASHIER|MEMBER)

├── membership/ MembershipController, MembershipService, MembershipExpiryScheduler

│ entities: MembershipPlan, Membership

├── checkin/ CheckInController, CheckInService, QrTokenService

│ entities: CheckIn, QrToken websocket: CheckInWebSocketHandler

├── payment/ PaymentController, PaymentService

│ strategy: PaymentStrategy (sealed), CashOnly, TrackAndReceipt, FullProcessing

│ entity: Payment

└── analytics/ AnalyticsController, AnalyticsService

dto: AttendanceStats, RevenueReport, HeatmapData

Flyway migrations live at src/main/resources/db/migration/ - V1 through V8 covering all tables in dependency order.

## 2.2 Next.js Frontend - Route Structure

src/app/

├── (auth)/login/ Staff login page

├── setup/ First-run wizard (Steps 1-6)

├── dashboard/ Staff portal (ADMIN + CASHIER)

│ ├── page.tsx Live check-in feed + today stats

│ ├── members/ Member list, search, registration form, profile drawer

│ ├── check-in/scanner/ QR scanner station (camera view)

│ ├── plans/ Membership plan management

│ ├── payments/ Payment log + record new payment

│ ├── analytics/ Attendance heatmap, revenue charts, retention

│ ├── locations/ Branch management

│ └── settings/ Org settings, staff management, audit log

└── member/ Member-facing PWA

├── page.tsx QR display + plan status home

├── history/ Check-in history

└── profile/ Member profile + renewal prompt

# 3\. Data Model

The schema is multi-location from day 1. Every entity belongs to an organization (and optionally a location). Self-hosted instances are single-organization by design, but the schema costs nothing extra and avoids a painful migration if a gym ever opens a second branch.

## 3.1 Entity Relationship Summary

| **Table**        | **Primary Key** | **Key Foreign Keys**                | **Notes**                                                 |
| ---------------- | --------------- | ----------------------------------- | --------------------------------------------------------- |
| organizations    | uuid            | -                                   | Root tenant. One per self-hosted instance.                |
| locations        | uuid            | org_id → organizations              | Branch/gym floor. V1 ships with one.                      |
| operating_hours  | uuid            | location_id → locations             | AM/PM session times per day-of-week.                      |
| users            | uuid            | org_id → organizations              | All humans: ADMIN, CASHIER, MEMBER.                       |
| membership_plans | uuid            | location_id → locations             | Plan templates. Prices, durations, allowed days/sessions. |
| memberships      | uuid            | user_id, plan_id, location_id       | A member's active or historical plan instance.            |
| payments         | uuid            | membership_id, user_id              | Payment records per membership.                           |
| check_ins        | uuid            | user_id, membership_id, location_id | Every attendance event. Immutable after write.            |
| qr_tokens        | uuid            | user_id                             | Short-lived DB record. Primary store is Redis TTL.        |
| audit_log        | uuid            | org_id, actor_id                    | Append-only. Every mutation. Never updated or deleted.    |

## 3.2 Key Design Decisions

| **Decision**           | **Choice**                                               | **Rationale**                                                                                  |
| ---------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Money storage          | DECIMAL(12,4)                                            | No float precision loss. Supports any currency's minor units.                                  |
| Timezone handling      | org.timezone (IANA string)                               | All session computation uses ZoneId.of(org.timezone) - no UTC confusion                        |
| QR token storage       | Redis primary + Postgres secondary                       | Redis TTL handles expiry automatically. Postgres qr_tokens for audit trail only.               |
| Check-in immutability  | No UPDATE on check_ins                                   | Every event is a new row. Overrides are new rows with status=EXPIRED_PLAN and override fields. |
| Soft deletes           | is_active boolean on users/plans/locations               | No hard deletes. Historical records always intact for audit.                                   |
| check_ins partitioning | PARTITION BY RANGE(check_in_time) - documented, optional | High-volume gyms can partition monthly. Single-gym installs don't need it.                     |
| Denormalized org_id    | On check_ins and memberships                             | Avoids JOIN chain for the hottest query: 'all today's check-ins for this gym'                  |

# 4\. QR Check-In Architecture

## 4.1 Token Lifecycle

| **Step**      | **Action**                                                            | **Storage**                                       |
| ------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| 1\. Request   | Member taps 'Check In' on PWA                                         | -                                                 |
| 2\. Generate  | API: SecureRandom.hex(32) → 64-char token                             | Redis SET qr:{token} userId EX 120 (atomic)       |
| 3\. Render    | ZXing generates QR PNG encoding the token string                      | Returned as base64 in response body               |
| 4\. Display   | PWA renders QR on screen                                              | Cached in component state - refreshed on next tap |
| 5\. Scan      | Cashier scans via @zxing/browser or member presents to static scanner | -                                                 |
| 6\. Validate  | API: Redis GETDEL qr:{token} - atomic get + delete                    | Redis (single-use guaranteed)                     |
| 7\. Check     | Membership active? Session valid? Day allowed? Max check-ins?         | PostgreSQL                                        |
| 8\. Write     | INSERT check_ins - atomic, within @Transactional                      | PostgreSQL                                        |
| 9\. Broadcast | Redis PUBLISH checkin:{orgId} → WebSocket handler → cashier dashboard | Redis pub/sub → WebSocket                         |

**Atomic Single-Use Guarantee**

Redis GETDEL is a single atomic operation - GET the value and DELETE the key in one command. Even if two cashiers scan the same QR simultaneously, only one gets the user_id back. The second gets nil and returns an error. No race condition possible.

## 4.2 Check-In Validation Logic (CheckInService)

- Decode QR string - call Redis GETDEL qr:{token}. If nil: TOKEN_INVALID or TOKEN_EXPIRED.
- Load user - fetch User by id from result. If not found or not MEMBER role: MEMBER_NOT_FOUND.
- Verify org - confirm user.orgId matches the cashier's orgId (from JWT claims). Prevents cross-gym QR misuse.
- Load active membership - query memberships WHERE userId=X AND status=ACTIVE AND locationId=Y.
- Check expiry - if membership.endDate < LocalDate.now(orgTz): status=EXPIRED_PLAN, still write record.
- Check session - compute current session from LocalTime + operating_hours. If plan.allowedSessions does not include current session: WRONG_SESSION.
- Check day - if plan.allowedDays does not include current DayOfWeek: WRONG_DAY.
- Check duplicate - if check_in exists for (userId, locationId, sessionType, DATE(now)): ALREADY_CHECKED_IN.
- Write check_in record @Transactional - status=VALID, method=QR_SCAN.
- Publish Redis event - CheckInEvent POJO serialized to JSON on channel checkin:{orgId}.
- Return CheckInResponse with member name, photo, plan details, session, status.

**Override Flow**

Cashier can call POST /api/v1/checkin/manual with overrideReason. This bypasses steps 5-7 (expiry/session/day checks) and writes status=EXPIRED_PLAN with override_by and override_reason populated. All overrides appear in audit log.

## 4.3 WebSocket Real-Time Feed

Spring WebSocket with STOMP. Cashier dashboard subscribes to /topic/checkins/{orgId} on connect. On check-in event:

- CheckInService publishes to Redis channel checkin:{orgId}
- CheckInWebSocketHandler receives from Redis pub/sub
- Handler converts to STOMP message, sends to /topic/checkins/{orgId}
- All connected cashier dashboards receive the event and prepend to their live feed

WebSocket connections are per-server-instance. For horizontal scaling, the Redis pub/sub bridge ensures all instances receive all events regardless of which instance processed the check-in.

# 5\. Payment Strategy Pattern

The PaymentService selects a strategy at runtime based on the organization's `payment_mode` setting. Adding a new gateway requires implementing one interface — no changes to PaymentService or controller.

public sealed interface PaymentStrategy

permits CashOnlyStrategy, TrackAndReceiptStrategy, FullProcessingStrategy {

PaymentResult processPayment(PaymentRequest request);

Optional&lt;byte\[\]&gt; generateReceipt(Payment payment);
Optional<byte[]> generateReceipt(Payment payment);

boolean requiresExternalConfirmation();

}

| Strategy            | Triggered By                 | Behavior                                                                                                                           |
| ----------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| CashOnlyStrategy        | payment_mode = CASH_ONLY         | Records amount, method, cashier. No receipt. No external call.                                                                         |
| TrackAndReceiptStrategy | payment_mode = TRACK_AND_RECEIPT | Extends cash: generates PDF receipt via iText **on-demand** (in-memory, streamed as HTTP response, **never stored on disk**). Emails if member has email address. |
| FullProcessingStrategy  | payment_mode = FULL_PROCESSING   | Gateway-hosted redirect only — no direct card entry through the portal. LemonSqueezy is the reference implementation. Paystack is the secondary implementation for NGN deployments. Returns a hosted payment URL. Webhook confirms, activates membership. |

# 6\. Auth Architecture

## 6.1 Staff Auth (Email + Password)

- POST /api/v1/auth/login - validate credentials, BCrypt verify
- Generate JWT access token (15 min, RS256 or HS256 depending on config)
- Generate refresh token (UUID), store in Redis: refresh:{token} → userId:role, TTL 7 days
- Return both tokens - access token in response body, refresh token in httpOnly cookie
- JwtAuthFilter validates access token on every protected request, attaches SecurityContext
- POST /api/v1/auth/refresh - verify refresh token in Redis whitelist, issue new access token
- POST /api/v1/auth/logout - delete refresh token from Redis (immediate revocation)

## 6.2 Member Auth (Phone/Email + OTP)

- POST /api/v1/auth/otp/request - validate identifier (phone or email), generate 6-digit OTP, store in Redis otp:{identifier} TTL 5min
- Rate limit: max 3 OTP requests per identifier per 10 minutes (Redis counter)
- **v1: OTP delivered via email only** using configured SMTP (default: Resend at smtp.resend.com). No SMS providers in v1. SMS (Termii/Twilio) is a v1.5 roadmap item.
- POST /api/v1/auth/otp/verify - verify OTP from Redis, delete on success, return same JWT + refresh token pair
- Member JWT has role=MEMBER claim - Spring Security @PreAuthorize enforces member-only scope

# 7\. Offline Strategy

Serwist (service worker library) handles the PWA caching strategy. The priority is: the QR check-in flow must degrade gracefully when a member has no signal at the gym entrance.

| **Cached Resource**          | **Strategy**                      | **Purpose**                                                      |
| ---------------------------- | --------------------------------- | ---------------------------------------------------------------- |
| App shell (JS/CSS/HTML)      | Cache First                       | Instant load on repeat visits                                    |
| Member profile + plan status | Stale While Revalidate            | Show current data while refreshing in background                 |
| Member QR display            | Network First with cache fallback | Try fresh token; show static member card if offline              |
| Cashier member list          | Stale While Revalidate, 1hr       | Allows name/photo lookup when offline                            |
| Check-in queue (IndexedDB)   | Client-side only                  | Offline check-ins stored locally, synced via Background Sync API |

Offline check-in sync: IndexedDB stores pending check-ins with timestamps. Background Sync API registers a sync event when connectivity returns. The sync handler calls POST /api/v1/checkin/sync with the batch. Server reconciles by checking for duplicate (userId, locationId, sessionType, date) entries and logs any conflicts.

# 8\. Infrastructure & Docker Compose

| **Service** | **Image**                 | **Internal Port** | **Notes**                                                                            |
| ----------- | ------------------------- | ----------------- | ------------------------------------------------------------------------------------ |
| api         | gymsynk/api (Spring Boot) | 8080              | Built from backend/Dockerfile. Multi-stage: Gradle build → JRE 21 slim image.        |
| web         | gymsynk/web (Next.js)     | 3000              | Built from frontend/Dockerfile. Multi-stage: pnpm build → node:slim.                 |
| db          | postgres:16-alpine        | 5432              | Primary data store. Volume: pgdata.                                                  |
| redis       | redis:7-alpine            | 6379              | QR tokens, sessions, pub/sub. Volume: redisdata. Persistence: AOF enabled.           |
| traefik     | traefik:v3                | 80/443 (public)   | Auto TLS via ACME. Routes by Host header. Docker label-based config.                 |

**Standalone VPS Deployment**

GymSynk is configured as a fully standalone deployment. It runs its own Traefik container that binds directly to the host's ports 80 and 443 to manage routing and automatically provision Let's Encrypt TLS certificates. All services are isolated on their own internal network and have no dependencies or connections to other applications running on the host.