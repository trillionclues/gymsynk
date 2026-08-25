# GymSynk — Open-Source Gym Management Platform

> **Self-hosted, QR-powered gym management for gyms of any size.**
> Built with Spring Boot 3.4 (Java 21) + Next.js 15 PWA.
> Licensed under AGPL-3.0.

---

## Problem Statement

Small-to-medium gyms rely on manual membership tracking — cashiers memorize faces, paper logs track payments, and member status lives in someone's head. This breaks at any scale and creates zero accountability. GymSynk bridges this gap with a lightweight, self-hosted system that any gym can deploy without vendor lock-in, while being architecturally sound enough to scale to multi-location chains.

**The Core Problem:** A cashier manually knows who is on a weekly, monthly, or daily plan. This is fragile, unscalable, unauditable, and invisible to members themselves.

**The Solution:** A cashier portal for registration, plan management, and real-time check-in monitoring — plus a member-facing PWA with a scannable QR code. The cashier stays in control; the system gives her the tools to exercise that control with precision and an audit trail.

---

## Resolved Design Decisions

| Decision | Resolution |
|:---------|:-----------|
| License | **AGPL-3.0** — fully open source, no premium tier, no paid features. Anyone hosting a fork as a service must publish their source. |
| Demo gym name | **GymSynk** (seed data org name) |
| File storage | **None** — no MinIO, no upload volume. Profile photos and gym logos use auto-generated avatars via DiceBear (initials-based). |
| Receipt persistence | **None** — receipts are generated on-demand per request using iText, streamed as an HTTP response (`application/pdf`), never stored on disk. |
| OTP delivery (member auth) | **Email only** via Resend for v1. No SMS providers (Termii/Twilio) in v1. |
| Default SMTP provider | **Resend** (`smtp.resend.com`). Operators can override with any generic SMTP config via env vars. |
| Reverse proxy | **Traefik v3** with auto-TLS via ACME/Let's Encrypt. Nginx is documented as an optional alternative in `/docs/nginx.conf`. |
| Payment modes | CASH_ONLY / TRACK_AND_RECEIPT / FULL_PROCESSING via Strategy pattern. Mode is set at setup, changeable from admin settings. |
| Membership expiry warning | **5 days** before expiry — both in the member PWA renewal CTA and the backend email notification scheduler. |
| VPS target | 1 vCPU / 2 GiB RAM / 25 GiB SSD (Ubuntu 24.04). JVM tuned to `-Xms256m -Xmx512m -XX:+UseZGC`. |
| Multi-gym / multi-org | Schema is multi-org, multi-location from day 1. Self-hosted instances are typically single-org, but any gym can spin up their own instance. No SaaS shared-database multi-tenancy. |

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────┐
│                   Client Layer                       │
│  ┌─────────────────────┐  ┌────────────────────┐    │
│  │  Cashier / Admin    │  │   Member PWA       │    │
│  │  Portal (Next.js)   │  │   (Next.js PWA)    │    │
│  └─────────────────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│              Traefik v3 (Reverse Proxy)              │
│         Auto-TLS via ACME · Docker routing           │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│            Application Layer                         │
│  ┌──────────────────────────────────────────────┐   │
│  │  Spring Boot 3.4 / Java 21 (Virtual Threads) │   │
│  │  REST API + Spring WebSocket (STOMP)         │   │
│  └──────────────────────────────────────────────┘   │
└──────┬────────────────────┬───────────────────┬─────┘
       │                    │                   │
┌──────▼──────┐  ┌──────────▼──────┐  ┌────────▼────────┐
│ PostgreSQL  │  │   Redis 7       │  │  SMTP (Resend)  │
│    16       │  │ QR tokens,      │  │  Email notifs   │
│ Primary DB  │  │ sessions, pub/  │  │  Receipt emails │
└─────────────┘  │ sub, rate limit │  └─────────────────┘
                 └─────────────────┘

No file storage layer. No MinIO. No upload volumes.
Avatars: DiceBear (client-side, initials-based)
Receipts: iText in-memory → streamed as HTTP response
```

### Technology Stack

| Layer | Technology | Version | Rationale |
|:------|:-----------|:--------|:----------|
| API Server | Spring Boot | 3.4 | Virtual threads, mature ecosystem |
| Language | Java | 21 (LTS) | Virtual threads (Project Loom), records, pattern matching |
| Database | PostgreSQL | 16 | ACID check-in writes, JSONB config, proven at scale |
| ORM / Migrations | Hibernate 6 + Flyway | current | JPA for queries, Flyway for version-controlled migrations |
| Cache | Redis | 7 | QR token TTL, refresh token whitelist, pub/sub, rate limiting |
| Auth | Spring Security + JWT | 6.x | Stateless JWT + Redis refresh token whitelist |
| QR Generation | ZXing (backend) | current | PNG QR from opaque token |
| QR Scanning | @zxing/browser (frontend) | current | Client-side camera API |
| Real-time | Spring WebSocket (STOMP) | built-in | Cashier dashboard live check-in feed |
| Frontend | Next.js | 15 (App Router) | SSR, PWA via Serwist, App Router |
| Styling | Tailwind CSS + shadcn/ui | current | Accessible primitives, rapid UI |
| Avatar | DiceBear | current | Auto-generated avatars from name/initials — no file uploads |
| PWA | Serwist | current | Service worker, offline caching, Background Sync |
| PDF Receipts | iText Community (AGPL) | current | On-demand generation, streamed, never stored |
| Reverse Proxy | Traefik | v3 | Auto-TLS, Docker label routing |
| Build (backend) | Gradle (Kotlin DSL) | 8.x | Faster than Maven, modern DSL |
| Build (frontend) | pnpm + Turborepo | current | Fast installs, monorepo support |
| Email | Resend (default) / Generic SMTP | — | Configurable via env vars |

---

## Database Schema Design

### Multi-Location Architecture

The schema is multi-org, multi-location from day 1. Each self-hosted instance is one organization. The hierarchy costs nothing extra and avoids a painful migration if a gym opens a second branch.

```
organizations → locations → membership_plans
organizations → users → memberships → payments
memberships → check_ins
users → qr_tokens
organizations → audit_log
```

### Core Tables

#### `organizations`
```sql
CREATE TABLE organizations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(255) NOT NULL,
    slug             VARCHAR(100) UNIQUE NOT NULL,
    -- No logo_url — logo is auto-generated avatar from name initials via DiceBear
    default_currency  VARCHAR(3) DEFAULT 'NGN',
    timezone         VARCHAR(50) DEFAULT 'Africa/Lagos',
    payment_mode     VARCHAR(20) NOT NULL DEFAULT 'CASH_ONLY',
                     -- CASH_ONLY | TRACK_AND_RECEIPT | FULL_PROCESSING
    setup_complete   BOOLEAN DEFAULT FALSE,
    settings         JSONB DEFAULT '{}',
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

#### `locations`
```sql
CREATE TABLE locations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    address     TEXT,
    phone       VARCHAR(20),
    is_active   BOOLEAN DEFAULT TRUE,
    settings    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, name)
);
CREATE INDEX idx_locations_org ON locations(org_id);
```

#### `operating_hours`
```sql
CREATE TABLE operating_hours (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    session_type VARCHAR(10) NOT NULL CHECK (session_type IN ('MORNING', 'EVENING')),
    open_time    TIME NOT NULL,
    close_time   TIME NOT NULL,
    is_active    BOOLEAN DEFAULT TRUE,
    UNIQUE(location_id, day_of_week, session_type)
);
CREATE INDEX idx_operating_hours_location ON operating_hours(location_id);
```

#### `users`
```sql
CREATE TABLE users (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email                   VARCHAR(255),
    phone                   VARCHAR(20),
    password_hash           VARCHAR(255),
    first_name              VARCHAR(100) NOT NULL,
    last_name               VARCHAR(100) NOT NULL,
    date_of_birth           DATE,
    gender                  VARCHAR(10),
    -- No photo_url column — avatars are generated client-side from name initials via DiceBear
    role                    VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
                            -- ADMIN | CASHIER | MEMBER
    member_number           VARCHAR(10) UNIQUE,  -- GS-XXXXX, only for MEMBER role
    is_active               BOOLEAN DEFAULT TRUE,
    emergency_contact_name  VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    notes                   TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, email),
    UNIQUE(org_id, phone)
);
CREATE INDEX idx_users_org_role ON users(org_id, role);
CREATE INDEX idx_users_name ON users(org_id, last_name, first_name);
CREATE INDEX idx_users_member_number ON users(member_number);
```

#### `membership_plans`
```sql
CREATE TABLE membership_plans (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id         UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    price               DECIMAL(12, 4) NOT NULL,
    duration_type       VARCHAR(10) NOT NULL
                        CHECK (duration_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM')),
    duration_value      INT NOT NULL DEFAULT 1,
    allowed_sessions    VARCHAR(10)[] DEFAULT ARRAY['MORNING', 'EVENING'],
    allowed_days        SMALLINT[] DEFAULT ARRAY[0,1,2,3,4,5,6],
    max_checkins_per_day INT DEFAULT 1,
    is_active           BOOLEAN DEFAULT TRUE,
    sort_order          INT DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_plans_location ON membership_plans(location_id);
```

#### `memberships`
```sql
CREATE TABLE memberships (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id     UUID NOT NULL REFERENCES membership_plans(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    org_id      UUID NOT NULL REFERENCES organizations(id), -- denormalized for hot query
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                -- ACTIVE | EXPIRED | FROZEN | CANCELLED
    auto_renew  BOOLEAN DEFAULT FALSE,
    notes       TEXT,
    created_by  UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(status, end_date);
CREATE INDEX idx_memberships_expiry ON memberships(end_date) WHERE status = 'ACTIVE';
CREATE INDEX idx_memberships_location ON memberships(location_id);
```

#### `payments`
```sql
CREATE TABLE payments (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id  UUID NOT NULL REFERENCES memberships(id),
    user_id        UUID NOT NULL REFERENCES users(id),
    org_id         UUID NOT NULL REFERENCES organizations(id), -- denormalized
    amount         DECIMAL(12, 4) NOT NULL,
    currency       VARCHAR(3) NOT NULL DEFAULT 'NGN',
    payment_method VARCHAR(20) NOT NULL DEFAULT 'CASH',
                   -- CASH | CARD | TRANSFER | ONLINE
    payment_status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
                   -- PENDING | COMPLETED | FAILED | REFUNDED
    reference      VARCHAR(100),
    receipt_number VARCHAR(50) UNIQUE,
    external_ref   VARCHAR(255), -- gateway transaction ID (FULL_PROCESSING only)
    notes          TEXT,
    received_by    UUID REFERENCES users(id),
    created_at     TIMESTAMPTZ DEFAULT NOW()
    -- No receipt_file_path — receipts generated on-demand, streamed, never stored
);
CREATE INDEX idx_payments_membership ON payments(membership_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_date ON payments(created_at);
CREATE INDEX idx_payments_receipt ON payments(receipt_number);
```

#### `check_ins`
```sql
CREATE TABLE check_ins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    membership_id   UUID REFERENCES memberships(id),
    location_id     UUID NOT NULL REFERENCES locations(id),
    org_id          UUID NOT NULL REFERENCES organizations(id), -- denormalized
    session_type    VARCHAR(10) NOT NULL CHECK (session_type IN ('MORNING', 'EVENING')),
    check_in_time   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_in_method VARCHAR(20) NOT NULL DEFAULT 'QR_SCAN',
                    -- QR_SCAN | MANUAL
    verified_by     UUID REFERENCES users(id), -- cashier who verified; NULL for self-QR
    status          VARCHAR(20) NOT NULL DEFAULT 'VALID',
                    -- VALID | EXPIRED_PLAN | WRONG_SESSION | WRONG_DAY | ALREADY_CHECKED_IN | OVERRIDE
    override_by     UUID REFERENCES users(id),
    override_reason TEXT,
    synced          BOOLEAN DEFAULT TRUE, -- FALSE for offline check-ins pending sync
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_checkins_user ON check_ins(user_id, check_in_time DESC);
CREATE INDEX idx_checkins_location ON check_ins(location_id, check_in_time DESC);
CREATE INDEX idx_checkins_date ON check_ins(check_in_time);
CREATE INDEX idx_checkins_session ON check_ins(location_id, session_type, check_in_time);
CREATE INDEX idx_checkins_unsynced ON check_ins(synced) WHERE synced = FALSE;
-- Partitioning by range on check_in_time is documented for high-volume deployments (optional)
```

#### `qr_tokens`
```sql
CREATE TABLE qr_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id),
    token      VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN DEFAULT FALSE,
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
    -- Primary store is Redis (TTL-based). This table is audit trail only.
);
CREATE INDEX idx_qr_tokens_token ON qr_tokens(token) WHERE used = FALSE;
CREATE INDEX idx_qr_tokens_expiry ON qr_tokens(expires_at);
```

#### `audit_log`
```sql
CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id),
    actor_id    UUID REFERENCES users(id),
    action      VARCHAR(50) NOT NULL,
                -- MEMBER_CREATED | PAYMENT_RECORDED | CHECK_IN | CHECK_IN_OVERRIDE
                -- | PLAN_MODIFIED | MEMBERSHIP_RENEWED | MEMBER_UPDATED | STAFF_DEACTIVATED | etc.
                -- OVERRIDE check-ins get their own CHECK_IN_OVERRIDE action so they are
                -- independently filterable in the audit log UI without scanning check_in status.
    entity_type VARCHAR(50) NOT NULL,
    entity_id   UUID,
    old_value   JSONB,
    new_value   JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ DEFAULT NOW()
    -- Append-only. Never updated or deleted. Consider monthly partitioning for high volume.
);
CREATE INDEX idx_audit_org ON audit_log(org_id, created_at DESC);
CREATE INDEX idx_audit_actor ON audit_log(actor_id, created_at DESC);
```

### Flyway Migration Order

```
V1__create_organizations.sql
V2__create_locations.sql
V3__create_operating_hours.sql
V4__create_users.sql
V5__create_membership_plans.sql
V6__create_memberships.sql
V7__create_payments.sql
V8__create_check_ins.sql
V9__create_qr_tokens.sql
V10__create_audit_log.sql
```

---

## QR Check-In System

### Token Lifecycle

```
Member taps "Check In" on PWA
        │
        ▼
POST /api/v1/checkin/qr-token  (MEMBER role)
        │
        ▼
API: SecureRandom.nextBytes(32) → 64-char hex token
API: Redis SET qr:{token} → userId  EX 120  (atomic)
API: ZXing generates QR PNG from token string
        │
        ▼
PWA renders QR at 280×280px with 120s countdown timer
        │
        ▼
Cashier scans via @zxing/browser  (or member self-presents)
        │
        ▼
POST /api/v1/checkin/validate  (CASHIER/ADMIN role)
        │
        ▼
API: Redis GETDEL qr:{token}  ← single atomic op, ensures single-use
        │
        ├─► nil   → TOKEN_INVALID or TOKEN_EXPIRED
        │
        └─► userId
              │
              ▼
        Validate org, active membership, session, day, duplicate
              │
              ├─► Invalid → write check_in (status=EXPIRED_PLAN etc.), return error details
              │
              └─► Valid
                    │
                    ▼
              INSERT check_ins (status=VALID)  @Transactional
              Redis PUBLISH checkin:{orgId}
              WebSocket → cashier dashboard live feed
```

### Check-In Validation Steps (CheckInService)

1. `Redis GETDEL qr:{token}` — if nil: TOKEN_INVALID/TOKEN_EXPIRED
2. Load User by userId — if not found or not MEMBER: MEMBER_NOT_FOUND
3. Verify orgId matches cashier's JWT orgId claim — prevents cross-gym QR misuse
4. Load active Membership for (userId, locationId)
5. Check expiry: `membership.endDate < LocalDate.now(orgTz)` → EXPIRED_PLAN (still write record)
6. Check session: compute current session from LocalTime + operating_hours → WRONG_SESSION
7. Check day: `plan.allowedDays` does not include current DayOfWeek → WRONG_DAY
8. Check duplicate: check_in exists for (userId, locationId, sessionType, date) → ALREADY_CHECKED_IN
9. `INSERT check_ins` @Transactional (status=VALID, method=QR_SCAN)
10. `Redis PUBLISH checkin:{orgId}` → WebSocket broadcast to cashier dashboard

**Override Flow:** `POST /api/v1/checkin/manual` with `X-Override: true` header bypasses steps 5–7. Writes status=OVERRIDE with `override_by` and `override_reason`. All overrides appear in audit_log.

### Offline Check-In Strategy

```
Member arrives at gym
        │
        ├─► Internet available
        │       └─► Normal QR flow (steps above)
        │
        └─► No internet / QR fails
                │
                ▼
        PWA shows static member card (name + member number)
        from service worker cache (Stale-While-Revalidate)
                │
                ▼
        Cashier searches member by name/phone
        (cashier member list cached for 1hr via Serwist)
                │
                ▼
        Cashier manually checks in → queued in IndexedDB
        (synced=false, timestamped)
                │
                ▼
        Background Sync API fires when connectivity returns
        POST /api/v1/checkin/sync (batch)
        Server reconciles, deduplicates by
        (user_id, location_id, session_type, DATE(check_in_time))
```

---

## Role-Based Access Control

### Permission Matrix

| Feature | ADMIN | CASHIER | MEMBER |
|:--------|:-----:|:-------:|:------:|
| Setup & Configuration | ✅ | ❌ | ❌ |
| Manage Locations | ✅ | ❌ | ❌ |
| Manage Plans | ✅ | ❌ | ❌ |
| Register Members | ✅ | ✅ | ❌ |
| Edit Member Details | ✅ | ✅ (limited) | Own profile |
| Process Check-ins | ✅ | ✅ | Self (QR) |
| Record Payments | ✅ | ✅ | ❌ |
| Download Receipt PDF | ✅ | ✅ | Own only |
| View All Members | ✅ | ✅ | ❌ |
| View Analytics | ✅ | Basic stats | ❌ |
| Manage Staff | ✅ | ❌ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ |
| Export CSV | ✅ | ❌ | ❌ |
| View Own Profile | ✅ | ✅ | ✅ |
| View Check-in History | ✅ | ✅ | Own only |

**Planned v1.5 role: FLOOR_STAFF** — read-only + can scan/check-in. Schema and permission enum include this from day 1.

### Auth Flows

**Staff (ADMIN/CASHIER):** Email + password → JWT access token (15 min) + refresh token in Redis (7 days, httpOnly cookie).

**Member:** Phone or email → 6-digit OTP via Resend email (v1, no SMS) → JWT pair. OTP stored in Redis (`otp:{identifier}`, TTL 5 min). Rate-limited: max 3 OTP requests per identifier per 10 minutes.

---

## Payment System

### Three Configurable Modes (Strategy Pattern)

```java
public sealed interface PaymentStrategy
    permits CashOnlyStrategy, TrackAndReceiptStrategy, FullProcessingStrategy {
    PaymentResult processPayment(PaymentRequest request);
    Optional<byte[]> generateReceipt(Payment payment); // iText in-memory; never stored
    boolean requiresExternalConfirmation();
}
```

| Mode | Triggered By | Behavior |
|:-----|:------------|:---------|
| CASH_ONLY | `payment_mode = CASH_ONLY` | Records amount, method, cashier. No receipt. |
| TRACK_AND_RECEIPT | `payment_mode = TRACK_AND_RECEIPT` | Records payment + generates PDF receipt via iText on-demand (streamed, not stored). Emails receipt if member has email. |
| FULL_PROCESSING | `payment_mode = FULL_PROCESSING` | Gateway-hosted redirect only — no direct card entry through the portal. LemonSqueezy is the reference implementation (existing integration). Paystack is the secondary implementation (Nigerian market default). Returns a hosted payment URL; member or cashier opens the link. Webhook confirms, activates membership. |

Money: `DECIMAL(12,4)` in minor units. Default currency: NGN (configurable per org, ISO 4217).

---

## Backend Package Structure

```
com.gymsynk/
├── GymSynkApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── WebSocketConfig.java
│   ├── RedisConfig.java
│   ├── CorsConfig.java
│   └── OpenApiConfig.java
├── common/
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── BusinessException.java
│   │   └── ErrorResponse.java
│   ├── audit/
│   │   ├── AuditService.java
│   │   └── AuditAspect.java     (@Auditable AOP aspect)
│   └── util/
│       ├── QrCodeGenerator.java  (ZXing PNG generation)
│       └── ReceiptGenerator.java (iText PDF, returns byte[])
├── auth/
│   ├── AuthController.java
│   ├── AuthService.java
│   ├── JwtService.java
│   ├── JwtAuthFilter.java
│   └── dto/ (LoginRequest, TokenResponse, OtpRequest, OtpVerifyRequest)
├── organization/
│   ├── OrganizationController.java
│   ├── OrganizationService.java
│   ├── SetupService.java
│   ├── entity/Organization.java
│   └── dto/ (SetupRequest, OrgResponse)
├── location/
│   ├── LocationController.java
│   ├── LocationService.java
│   └── entity/ (Location, OperatingHours)
├── member/
│   ├── MemberController.java
│   ├── MemberService.java
│   ├── entity/User.java
│   └── dto/ (MemberRegistrationRequest, MemberResponse)
├── membership/
│   ├── MembershipController.java
│   ├── MembershipService.java
│   ├── MembershipExpiryScheduler.java  (cron, marks expired, sends 5-day warning email)
│   ├── entity/ (MembershipPlan, Membership)
│   └── dto/
├── checkin/
│   ├── CheckInController.java
│   ├── CheckInService.java
│   ├── QrTokenService.java
│   ├── entity/ (CheckIn, QrToken)
│   ├── dto/ (CheckInResponse, QrTokenResponse)
│   └── websocket/CheckInWebSocketHandler.java
├── payment/
│   ├── PaymentController.java
│   ├── PaymentService.java
│   ├── strategy/
│   │   ├── PaymentStrategy.java (sealed interface)
│   │   ├── CashOnlyStrategy.java
│   │   ├── TrackAndReceiptStrategy.java
│   │   └── FullProcessingStrategy.java
│   ├── entity/Payment.java
│   └── dto/
└── analytics/
    ├── AnalyticsController.java
    ├── AnalyticsService.java
    ├── AnalyticsAggregator.java  (@Scheduled nightly pre-compute)
    └── dto/ (AttendanceStats, RevenueReport, HeatmapData)
```

---

## Frontend Route Structure

```
src/app/
├── (auth)/login/            Staff login (email + password)
├── setup/                   First-run wizard (Steps 1–6)
├── dashboard/               Staff portal (ADMIN + CASHIER)
│   ├── page.tsx             Live check-in feed + today stats
│   ├── members/             List, search, registration form, profile drawer
│   ├── check-in/scanner/    QR scanner station (full-screen camera)
│   ├── plans/               Membership plan management
│   ├── payments/            Payment log + record new payment
│   ├── analytics/           Heatmap, revenue charts, retention (ADMIN)
│   ├── locations/           Branch management
│   └── settings/            Org settings, staff management, audit log
└── member/                  Member-facing PWA
    ├── page.tsx             QR display + plan status + countdown
    ├── history/             Check-in history (paginated)
    └── profile/             Plan details + renewal CTA at 5 days
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| `POST` | `/api/v1/auth/login` | Public | Staff login |
| `POST` | `/api/v1/auth/refresh` | Public | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Auth | Invalidate refresh token |
| `POST` | `/api/v1/auth/otp/request` | Public | Request OTP (email delivery) |
| `POST` | `/api/v1/auth/otp/verify` | Public | Verify OTP, return JWT pair |
| `POST` | `/api/v1/setup` | Public* | First-time setup (*disabled after setup_complete) |
| `GET` | `/api/v1/org` | Admin | Get organization details |
| `PUT` | `/api/v1/org` | Admin | Update organization settings |
| `GET` | `/api/v1/locations` | Staff+ | List locations |
| `POST` | `/api/v1/locations` | Admin | Create location |
| `PUT` | `/api/v1/locations/{id}` | Admin | Update location |
| `GET` | `/api/v1/members` | Staff+ | List members (paginated, searchable) |
| `POST` | `/api/v1/members` | Staff+ | Register new member |
| `GET` | `/api/v1/members/{id}` | Staff+/Self | Get member profile |
| `PATCH` | `/api/v1/members/{id}` | Staff+/Self | Update member |
| `GET` | `/api/v1/plans` | Staff+ | List plans for location |
| `POST` | `/api/v1/plans` | Admin | Create plan |
| `PUT` | `/api/v1/plans/{id}` | Admin | Update plan |
| `POST` | `/api/v1/memberships` | Staff+ | Assign membership |
| `GET` | `/api/v1/memberships/{id}` | Staff+/Self | Get membership |
| `PUT` | `/api/v1/memberships/{id}/renew` | Staff+ | Renew membership |
| `POST` | `/api/v1/checkin/qr-token` | Member | Generate QR token |
| `POST` | `/api/v1/checkin/validate` | Staff+ | Validate QR and check in |
| `POST` | `/api/v1/checkin/manual` | Staff+ | Manual check-in |
| `GET` | `/api/v1/checkin/today` | Staff+ | Today's check-in log |
| `POST` | `/api/v1/checkin/sync` | Staff+ | Sync offline check-ins |
| `POST` | `/api/v1/payments` | Staff+ | Record payment |
| `GET` | `/api/v1/payments` | Staff+ | List payments |
| `GET` | `/api/v1/payments/{id}/receipt` | Staff+/Self | Download receipt PDF (streamed) |
| `GET` | `/api/v1/analytics/attendance` | Admin | Attendance stats |
| `GET` | `/api/v1/analytics/revenue` | Admin | Revenue reports |
| `GET` | `/api/v1/analytics/heatmap` | Admin | 7×24 attendance heatmap |
| `GET` | `/api/v1/me` | Auth | Current user profile |
| `GET` | `/api/v1/me/checkins` | Member | Own check-in history |
| `GET` | `/api/v1/me/memberships` | Member | Own membership details |

**Pagination:** `?page=0&size=20&sort=createdAt,desc`
**Search:** `?search=john` (name, phone, member number)
**Filters:** `?status=ACTIVE&locationId=uuid`

---

## First-Time Setup Wizard

```
Step 1: Gym Details     → org name, timezone, currency (no logo upload — avatar from name)
Step 2: Location        → branch name, address, phone
Step 3: Operating Hours → AM/PM session times per day-of-week
Step 4: Payment Mode    → CASH_ONLY | TRACK_AND_RECEIPT | FULL_PROCESSING
Step 5: Plans           → pre-filled Daily/Weekly/Monthly templates (editable prices)
Step 6: Admin Account   → email + password
        → POST /api/v1/setup → org.setup_complete = true → redirect to /dashboard/login
```

Wizard is permanently disabled once `setup_complete = true`. The `SetupGuardFilter` blocks the `/setup` route for all subsequent requests.

**`setup-cli.sh` script** automates:
1. Generates `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `JWT_SECRET` (32-byte random hex)
2. Prompts for `DOMAIN`, `ACME_EMAIL`, `SMTP_PASSWORD`, `PAYMENT_MODE`
3. Writes `.env` from `.env.example`
4. Runs `docker compose up -d`
5. Polls `/api/v1/actuator/health` until healthy
6. Opens browser to `https://{DOMAIN}/setup`

---

## Scheduled Tasks

| Task | Schedule | Action |
|:-----|:---------|:-------|
| `MembershipExpiryScheduler` | Hourly (`0 0 * * * *`) | Mark ACTIVE memberships where `end_date < NOW()` as EXPIRED. Log each to audit_log. |
| `ExpiryWarningEmailJob` | Daily at 8 AM org timezone | Email members whose membership expires in exactly 5 days (using Resend/SMTP). |
| `QrTokenCleanupJob` | Daily at 3 AM | Purge `qr_tokens` rows where `expires_at < NOW()` and `used = TRUE`. (Redis handles its own TTL.) |
| `AnalyticsAggregator` | Nightly at 2 AM | Pre-compute daily/weekly/monthly stats into Redis. Dashboard reads from cache for instant load. |

---

## Implementation Phases

### Phase 0 — Foundation (Days 1–2)
- Spring Boot + Next.js scaffold
- Flyway migrations (V1–V10)
- Dev Docker Compose (DB + Redis only)
- Seed data: GymSynk demo org, 1 location, 1 ADMIN, 1 CASHIER, 20 MEMBERs with varied plan states

### Phase 1 — Backend API Core (Days 3–10)
- Auth: staff login, OTP email flow, JWT, refresh/logout
- Setup wizard API + SetupGuardFilter
- Member CRUD + member_number generation (GS-XXXXX)
- Plans + Memberships + ExpiryScheduler
- Check-in engine (QrTokenService + CheckInService full pipeline)
- WebSocket (STOMP) real-time feed
- Payment service (CashOnly + TrackAndReceipt strategies)
- Analytics endpoints + nightly aggregator

### Phase 2 — Cashier Portal (Days 11–18)
- Auth pages + dashboard layout + middleware auth guard
- Live check-in feed (WebSocket + CheckInFeed component)
- Member registration (multi-step form: react-hook-form + Zod)
- Member search + profile drawer + manual check-in
- QR scanner station (full-screen, @zxing/browser, auto-reset)
- Admin sections: plans CRUD, revenue charts, heatmap, staff management, audit log, CSV export

### Phase 3 — Member PWA (Days 19–24)
- OTP login (email → 6-digit code)
- QR home screen (generate → render → 120s countdown → expire)
- Offline fallback: static member card from cache
- Check-in history (infinite scroll, grouped by date)
- Profile page: plan details, expiry, renewal CTA at 5 days
- PWA manifest + Serwist service worker (Cache First app shell, SWR member data)

### Phase 4 — Setup Wizard + Hardening (Days 25–32)
- First-run setup wizard (Steps 1–6)
- setup-cli.sh script
- Integration tests: Testcontainers (full check-in pipeline, auth, expiry scheduler)
- E2E tests: Playwright (register → pay → QR scan → dashboard update)
- Rate limiting: Bucket4j on OTP + login endpoints (Redis-backed)
- Production Dockerfiles (multi-stage)
- EXPLAIN ANALYZE on 5 hottest queries + index review
- Smoke test on fresh VPS

### Phase 5 — Future Roadmap (Post-MVP)
- Full payment processing (LemonSqueezy / Paystack gateway)
- Membership freeze/pause
- Push notifications (web push for plan expiry)
- FLOOR_STAFF role UI
- Multi-location management UI (schema ready from day 1)
- K8s Helm charts
- Class/session booking system

---

## Testing Strategy

| Layer | Tool | Focus |
|:------|:-----|:-------|
| Unit | JUnit 5 + Mockito | QR token logic, session computation, plan expiry, payment strategy selection |
| Integration | Testcontainers + @SpringBootTest | Full check-in pipeline, auth lifecycle, offline sync, Flyway migrations |
| Frontend Component | React Testing Library + Vitest | CheckInFeed WebSocket updates, QR countdown, registration form validation |
| E2E | Playwright | Register → pay → QR scan → dashboard update. Setup wizard. Offline member card. |
| Load | k6 | 50 concurrent QR scans at opening time. Target: p99 < 500ms. |

---

## Environment Variables Reference

| Variable | Required | Description | Default |
|:---------|:---------|:------------|:--------|
| `DOMAIN` | Yes | Your gym's domain | — |
| `ACME_EMAIL` | Yes | Let's Encrypt cert email | — |
| `POSTGRES_PASSWORD` | Yes | DB password (auto-generated) | — |
| `REDIS_PASSWORD` | Yes | Redis auth (auto-generated) | — |
| `JWT_SECRET` | Yes | 32-byte hex (auto-generated) | — |
| `SMTP_HOST` | Optional | SMTP server | `smtp.resend.com` |
| `SMTP_PORT` | Optional | SMTP port | `465` |
| `SMTP_USERNAME` | Optional | SMTP username | `resend` |
| `SMTP_PASSWORD` | Optional | SMTP password / API key | — |
| `PAYMENT_MODE` | Yes | CASH_ONLY \| TRACK_AND_RECEIPT \| FULL_PROCESSING | `CASH_ONLY` |
| `PAYSTACK_SECRET_KEY` | Conditional | Required if `FULL_PROCESSING` + Paystack | — |
| `LEMONSQUEEZY_SECRET_KEY` | Conditional | Required if `FULL_PROCESSING` + LemonSqueezy | — |
| `SPRING_PROFILES_ACTIVE` | Auto | Set to `prod` by Compose | `prod` |

> **Removed:** `STORAGE_PATH` — no file storage. No uploads directory. No MinIO.

---

## Non-Functional Requirements

| Metric | Target | Notes |
|:-------|:-------|:------|
| QR check-in validation | < 200ms p99 | Redis GETDEL + single DB write |
| WebSocket check-in update | < 1s | Redis pub/sub → STOMP push |
| Member list search | < 300ms | Indexed full-text on name/phone/number |
| Dashboard page load | < 2s | SSR first paint; analytics pre-aggregated nightly |
| Concurrent check-ins | 50+ simultaneous | Java 21 virtual threads |
| VPS footprint | 1 vCPU / 2 GiB | JVM: `-Xms256m -Xmx512m -XX:+UseZGC -XX:+ZGenerational` |
| Disk usage alert | 70% of 25 GiB | Monitor — DB + logs grow over time, no uploads |
