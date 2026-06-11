**GymSynk**

_Open-Source Gym Management Platform_

Licensed under AGPL-3.0

**Implementation Guide**

Phase-by-Phase Build Plan - GymSynk v1.0

Version 1.0.0 | Engineering Playbook

Spring Boot 3.4 • Java 21 • Next.js 15 • PostgreSQL 16

Generated: 9 June 2026

# **1\. Repository Structure**

GymSynk is a two-app monorepo. Backend and frontend are separate directories sharing a root docker-compose.yml and .env file.

gymsynk/

├── backend/ Spring Boot 3.4 + Java 21

│ ├── build.gradle.kts

│ ├── settings.gradle.kts

│ ├── Dockerfile

│ └── src/main/

│ ├── java/com/gymsynk/ (domain packages)

│ └── resources/

│ ├── application.yml

│ ├── application-dev.yml

│ ├── application-prod.yml

│ └── db/migration/ V1*\_...sql through V8*\_...sql

├── frontend/ Next.js 15 + Serwist PWA

│ ├── package.json

│ ├── next.config.ts

│ ├── Dockerfile

│ └── src/app/ (dashboard + member route groups)

├── docker-compose.yml Production Compose

├── docker-compose.dev.yml Dev Compose (DB + Redis only)

├── .env.example

├── setup-cli.sh Interactive first-run setup script

└── README.md

# **2\. Phase 0 - Project Foundation (Days 1-2)**

Set up both projects, shared infrastructure, and local dev environment. No feature code yet.

## **Backend Scaffold**

- Generate Spring Boot project via start.spring.io or Spring Initializr CLI. Dependencies: Spring Web, Spring Security, Spring Data JPA, Spring WebSocket, Flyway, PostgreSQL driver, Spring Data Redis, Lombok, SpringDoc OpenAPI, Validation.
- Configure Gradle Kotlin DSL: set Java 21 toolchain, enable virtual threads in application.yml (spring.threads.virtual.enabled: true).
- Write application-dev.yml: point to local Docker DB and Redis from docker-compose.dev.yml.
- Write V1 through V8 Flyway migrations - all tables in dependency order. Run once to verify schema creation.
- Write DataSeeder @Component (runs on @EventListener(ApplicationReadyEvent)): creates org 'GymSynk Demo', one location, one ADMIN user, one CASHIER user, 20 MEMBER users with varied plan states (active, expired, expiring-soon). Only runs when spring.profiles.active=dev.

## **Frontend Scaffold**

- Init Next.js 15 app: npx create-next-app@latest frontend --ts --tailwind --app --src-dir
- Install: shadcn/ui (init), Serwist, @zxing/browser, recharts, zustand, react-hook-form, zod, axios, date-fns.
- Configure Serwist in next.config.ts - app shell caching, Stale While Revalidate for API routes.
- Create /src/lib/api.ts - axios instance with base URL from NEXT_PUBLIC_API_URL, JWT interceptor (attaches access token from store, refreshes on 401).
- Create /src/stores/authStore.ts - Zustand store for user session, role, access token.

## **Docker Dev Environment**

- Write docker-compose.dev.yml - only postgres:16-alpine, redis:7-alpine. Expose ports to localhost. No app containers in dev.
- Verify: docker compose -f docker-compose.dev.yml up -d → Flyway migrations run → Drizzle Studio equivalent (DBeaver or psql) shows all 10 tables.

**Phase 0 Exit Criteria**

./gradlew bootRun starts API on :8080, hits GET /api/v1/actuator/health → UP. pnpm dev starts frontend on :3000. Seed data visible in DB. Both processes running simultaneously with no port conflicts.

# **3\. Phase 1 - Backend API Core (Days 3-10)**

## **3.1 Security & Auth**

- Write SecurityConfig: disable CSRF, configure stateless session, set up JwtAuthFilter in filter chain, configure @PreAuthorize globally.
- Write JwtService: generateAccessToken(userId, role, orgId), validateToken, extractClaims. Use JJWT library.
- Write JwtAuthFilter: extract Bearer token, call JwtService.validateToken, set SecurityContextHolder.
- Staff login (POST /api/v1/auth/login): BCryptPasswordEncoder.matches, generate JWT + refresh token, store refresh:{uuid} in Redis TTL 7d.
- Refresh (POST /api/v1/auth/refresh): GETDEL from Redis, validate, issue new access token.
- Logout (POST /api/v1/auth/logout): DEL refresh token from Redis.
- OTP request (POST /api/v1/auth/otp/request): validate identifier (email or phone), generate 6-digit, SET otp:{identifier} in Redis TTL 5min, rate limit via Redis INCR/EXPIRE per identifier. **v1: deliver OTP via email only (Resend/SMTP). No SMS in v1.**
- OTP verify (POST /api/v1/auth/otp/verify): GETDEL otp:{identifier}, issue JWT pair.

## **3.2 Setup & Organization**

- Write SetupService.isSetupComplete(): query organizations table for any row. If empty, redirect frontend to /setup.
- POST /api/v1/setup (accessible only when setup_complete=false): create organization, first location, operating_hours, admin user, initial plans from SetupRequest body.
- Write setup request Zod schema (frontend) and Java record (backend) with full validation.

## **3.3 Member Management**

- POST /api/v1/members: validate request, generate member_number (GS- + padded sequence), hash nothing (no password for members), save User with role=MEMBER. **No photo upload — avatar generated client-side from name initials via DiceBear.**
- GET /api/v1/members: paginated, Spring Data Pageable. Search via Specification pattern on (firstName + lastName ILIKE, phone, member_number).
- GET /api/v1/members/{id}: return full profile with active membership and last 10 check-ins (join query).
- PATCH /api/v1/members/{id}: partial update using @Transactional - only update non-null fields from request.

## **3.4 Plans & Memberships**

- CRUD for MembershipPlan: admin-only creates/updates. GET is staff-accessible.
- POST /api/v1/memberships: validate plan exists for location, compute end_date from plan.durationType + durationValue + start_date using Java time API, save Membership, optionally call PaymentService.
- MembershipExpiryScheduler @Scheduled(cron='0 0 * * * *'): query memberships WHERE status=ACTIVE AND end_date < NOW(). Batch update to EXPIRED. Log each transition to audit_log.
- ExpiryWarningEmailJob @Scheduled(cron='0 0 8 * * *', tz=orgTz): query memberships WHERE status=ACTIVE AND end_date = LocalDate.now() + 5 days. Send expiry warning email via JavaMailSender. This aligns with the 5-day renewal CTA displayed in the member PWA.

## **3.5 Check-In Engine**

- Write QrTokenService: generateToken() - SecureRandom.nextBytes(32) → hex string, SET in Redis qr:{token}:{userId} TTL 120s. validateAndConsume(token) - GETDEL, return Optional&lt;UUID&gt;.
- Write CheckInService.validateAndRecord(): full 10-step pipeline from Design doc section 4.2. All within @Transactional.
- POST /api/v1/checkin/qr-token (MEMBER role): call QrTokenService, generate QR PNG via QrCodeGenerator (ZXing), return base64.
- POST /api/v1/checkin/validate (CASHIER/ADMIN role): receive QR string from scanner, call CheckInService.validateAndRecord().
- POST /api/v1/checkin/manual (CASHIER/ADMIN role): skip QR decode, look up member by ID or member_number, run validation from step 3 onward.
- POST /api/v1/checkin/manual with X-Override: true header: bypass validation steps 5-7, write with override fields.

## **3.6 WebSocket Setup**

- Write WebSocketConfig: configure STOMP endpoint /ws, enable simple broker on /topic.
- Write CheckInWebSocketHandler: inject RedisMessageListenerContainer, subscribe to checkin:{orgId} channels.
- On check-in write: publish JSON-serialized CheckInEvent to Redis channel. Handler receives, converts to STOMP message, sends to /topic/checkins/{orgId}.

## **3.7 Payment Service**

- Implement CashOnlyStrategy: record Payment entity, return PaymentResult.
- Implement TrackAndReceiptStrategy: extends cash, calls ReceiptGenerator (iText PDF) to generate receipt **on-demand in memory (byte[]), returned as HTTP response, never written to disk**. Emails PDF as attachment via JavaMailSender if member.email is present.
- Implement FullProcessingStrategy: call Paystack SDK initializeTransaction, return payment URL. Write webhook handler POST /api/v1/payments/webhook/paystack.
- PaymentService.processPayment(): select strategy based on org.paymentMode, delegate, activate membership on success.

## **3.8 Analytics**

- GET /api/v1/analytics/attendance: native JPQL query - group check_ins by DATE(check_in_time), session_type. Return 30-day rolling window by default.
- GET /api/v1/analytics/revenue: sum payments grouped by plan_type, payment_method, date.
- GET /api/v1/analytics/heatmap: group check_ins by EXTRACT(hour, check_in_time) and EXTRACT(dow, check_in_time). Return 7x24 grid values.
- AnalyticsAggregator @Scheduled(cron='0 0 2 \* \* \*'): nightly pre-compute and cache stats in Redis. Dashboard reads from cache - instant load.

**Phase 1 Exit Criteria**

All endpoints reachable and tested with Thunder Client or Postman. Full check-in pipeline works end-to-end: seed member → POST /checkin/qr-token → decode QR → POST /checkin/validate → check_in record in DB → WebSocket event emitted. Auth flows for all three roles work correctly.

# **4\. Phase 2 - Cashier Portal (Days 11-18)**

## **4.1 Layout & Auth**

- Build (auth)/login/page.tsx: email + password form, POST to /api/v1/auth/login, store tokens in authStore, redirect to /dashboard.
- Build dashboard/layout.tsx: sidebar nav (Dashboard, Members, Check-In, Payments, Analytics (admin only), Settings (admin only)), top bar with user name + logout.
- Write auth guard: middleware.ts checks for valid access token on /dashboard/\* routes - redirect to /login if absent.

## **4.2 Live Check-In Dashboard**

- Connect to WebSocket on /dashboard mount: useWebSocket hook wraps SockJS + STOMP client, subscribes to /topic/checkins/{orgId}.
- CheckInFeed component: receives events, prepends to state array (max 50 items), renders as a scrolling list of CheckInCard components.
- CheckInCard: member photo (local upload URL), name, member number, plan badge (colored by type), session badge (AM/PM), status badge (VALID green, EXPIRED_PLAN red, OVERRIDE yellow).
- Stats strip: today's totals fetched via GET /api/v1/analytics/today - live updates via WebSocket counter event alongside check-in events.
- Expiry alerts panel: GET /api/v1/members?expiringInDays=7, renders list with renew button per member.

## **4.3 Member Registration**

- Multi-step form (react-hook-form + Zod): Step 1 personal info, Step 2 plan selection (fetched from /api/v1/plans for current location), Step 3 payment details, Step 4 confirmation.
- Plan selector: renders cards from API - name, price, duration, allowed days/sessions. Not hardcoded.
- On submit: POST /api/v1/members → POST /api/v1/memberships → POST /api/v1/payments. All three in sequence, handle partial failure with error display.
- Success screen: QR code rendered from base64 response, member number, plan summary, print stylesheet for member card.

## **4.4 Member Search & Profile**

- Search bar: debounced 300ms, GET /api/v1/members?search={query}. Results in a table with status badges.
- Member profile sheet (shadcn Sheet): opens on row click. Shows photo, plan status, expiry, last 5 check-ins, payment history.
- Manual check-in button: opens session selector modal (MORNING/EVENING), POST /api/v1/checkin/manual.
- Override button (shown only when plan expired): opens reason input modal, POST with override flag.

## **4.5 QR Scanner Station**

- dashboard/check-in/scanner/page.tsx: full-screen camera view for tablet mounting at gym entrance.
- useQrScanner hook: initializes @zxing/browser BrowserQRCodeReader on mount, starts decoding from device camera.
- On decode: immediately POST /api/v1/checkin/validate with decoded string. Display full-screen result for 3 seconds (green VALID, red EXPIRED, yellow WRONG_SESSION).
- Auto-resets to scanning state after display timeout - no cashier interaction needed for valid check-ins.

## **4.6 Admin Sections**

- Plans management: CRUD table for membership_plans. Inline edit for price/duration. Toggle active/inactive.
- Revenue dashboard: Recharts BarChart for daily revenue by plan type. Line chart for 30-day trend. Stat cards for MTD totals.
- Attendance heatmap: custom 7x24 grid component with color intensity scaling (lighter = fewer, darker = more check-ins).
- Staff management: list of ADMIN/CASHIER users, invite new cashier (POST /api/v1/members with role=CASHIER), deactivate toggle.
- Audit log: paginated table, filterable by action type and date range. Expandable rows showing old_value/new_value JSON diff.
- CSV export buttons on member list, check-in log, and payment log - trigger download via Blob response from API.

**Phase 2 Exit Criteria**

Cashier can register a member, assign a plan, log a payment, and see them on the live dashboard - entirely from the browser on a tablet. Admin can edit plan prices and see the change reflected immediately in the registration form.

# **5\. Phase 3 - Member PWA (Days 19-24)**

- Build member/layout.tsx: minimal mobile-first layout, no sidebar - just logo, page title, bottom nav (Home, History, Profile).
- OTP login flow: member/(auth)/login - phone input → send OTP → 6-digit code input → verify → redirect to /member.
- member/page.tsx (home): large tap target 'Generate QR' button. On tap: POST /api/v1/checkin/qr-token, render base64 QR at 280x280px. Countdown timer showing 120s TTL. Plan status badge. Member number display.
- QR expiry UX: timer counts down live. When expired, button resets to 'Generate QR' state - member taps again for fresh token. No auto-refresh (prevents stale QR showing when member is nowhere near gym).
- Offline fallback: if QR token request fails (network error), show static member card: name + member number + plan status (from cache). Instruction text: 'Show this to the cashier for manual check-in.'
- member/history/page.tsx: infinite scroll list of check-ins, grouped by date. Shows session (AM/PM), status badge, plan name.
- member/profile/page.tsx: plan details, expiry date. Renewal CTA when within 5 days of expiry. **No photo upload — avatar is auto-generated from member's name initials via DiceBear.**
- PWA manifest: name GymSynk, theme color #4F46E5(still debatable for now until we discuss themeing in detail), display standalone, icons at 192 and 512px.
- Serwist config: Cache First for app shell, Stale While Revalidate for member profile and check-in history, Network First for QR token generation.

**Phase 3 Exit Criteria**

Member can install GymSynk to their Android home screen. Opening the app shows their QR immediately. Turning on airplane mode still shows the static member card. Check-in history loads from cache while refreshing in background.

# **6\. Phase 4 - First-Run Setup Wizard (Days 25-27)**

The setup wizard runs once - when the API has no organization record. After completion it is permanently inaccessible.

- API guard: SetupGuardFilter checks setup_complete on every non-setup request - if false, redirect frontend to /setup.
- Step 1 - Gym Details: org name, **auto-generated avatar logo from name initials (no file upload)**, timezone selector (IANA list), currency selector.
- Step 2 - Location: branch name, address, phone.
- Step 3 - Operating Hours: day-of-week grid, toggle AM/PM per day, time pickers for open/close.
- Step 4 - Payment Mode: radio card selection with description of each mode. If FULL_PROCESSING, show gateway API key fields.
- Step 5 - Plans: pre-filled templates (Daily 5k, Weekly 10k, Monthly 20k). Admin can edit prices, names, and allowed days before saving.
- Step 6 - Admin Account: email + password + confirm password. POST /api/v1/setup with full wizard state.
- On success: organization.setup_complete = true. Redirect to /dashboard/login.
- setup-cli.sh script: generates secure random POSTGRES_PASSWORD, REDIS_PASSWORD, JWT_SECRET, writes .env from .env.example, prompts for DOMAIN, ACME_EMAIL, SMTP_PASSWORD, and PAYMENT_MODE, runs docker compose up -d, polls /api/v1/actuator/health until healthy, opens browser to https://{DOMAIN}/setup.

# **7\. Phase 5 - Hardening (Days 28-32)**

- Integration tests: @SpringBootTest with Testcontainers (postgres:16, redis:7). Test the full check-in pipeline, OTP flow, payment strategy selection, and expiry scheduler.
- E2E tests: Playwright - register member, assign plan, generate QR, POST check-in API, verify dashboard update.
- Rate limiting: Bucket4j on OTP request and login endpoints (Redis-backed for multi-instance support).
- Input validation: ensure all controllers have @Valid on request bodies, GlobalExceptionHandler returns structured ErrorResponse for MethodArgumentNotValidException.
- Production Dockerfiles: multi-stage backend (gradle:8-jdk21 → eclipse-temurin:21-jre-alpine). Multi-stage frontend (node:20 for build → node:20-alpine for serve).
- Database query review: add EXPLAIN ANALYZE on the 5 hottest queries (member search, today's check-ins, active memberships, analytics aggregation, expiry scan). Add missing indexes.
- Smoke test: fresh VPS, run setup-cli.sh, complete wizard, register member, perform QR check-in, verify WebSocket update on cashier dashboard.

# **8\. Key Engineering Decisions**

| **Decision**                 | **Choice**                 | **Rationale**                                                                                                                       |
| ---------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Java vs Kotlin for backend   | Java 21                    | Records, virtual threads, and pattern matching land most modern Kotlin features in Java. Java has broader EU fintech hiring signal. |
| Virtual threads vs Reactive  | Virtual threads (Loom)     | Check-in bursts are I/O-bound (Redis + Postgres). Virtual threads handle this without Reactor/WebFlux complexity.                   |
| WebSocket vs SSE             | Spring WebSocket (STOMP)   | Bidirectional - cashier dashboard can also push overrides and commands. SSE would require a separate channel for commands.          |
| Opaque QR tokens vs JWT QR   | Redis opaque tokens        | No PII decodable from QR image. GETDEL makes single-use atomic even under concurrent scans.                                         |
| Hibernate vs jOOQ            | Hibernate 6 + JPA          | Simpler for the team. JPQL covers all queries. Native SQL for analytics aggregations where needed.                                  |
| Nginx vs Traefik             | Traefik (Nginx documented) | Standalone Traefik v3 reverse proxy with auto TLS. Nginx config included in /docs/nginx.conf for operators who prefer it.           |
| Flyway vs Liquibase          | Flyway                     | SQL-first, simpler mental model, better Spring Boot auto-configuration, sufficient for this schema size.                            |
| iText vs Jasper for receipts | iText Community (AGPL)     | Matches GymSynk license. PDF generation in-process - no extra service. Switch to OpenPDF if license is a concern.                   |

# **9\. Testing Strategy**

| **Layer**          | **Tool**                         | **Coverage Focus**                                                                                             |
| ------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Unit               | JUnit 5 + Mockito                | QR token generation/validation, session computation logic, plan expiry calculation, payment strategy selection |
| Integration        | Testcontainers + @SpringBootTest | Full check-in pipeline, auth token lifecycle, offline sync reconciliation, Flyway migration correctness        |
| Frontend Component | React Testing Library + Vitest   | CheckInFeed WebSocket updates, QR display/expiry countdown, registration form validation                       |
| E2E                | Playwright                       | Register → pay → QR scan → dashboard update. Setup wizard complete flow. Offline member card display.          |
| Load               | k6                               | Concurrent check-in burst simulation: 50 simultaneous QR scans at opening time. Target: p99 < 500ms.           |