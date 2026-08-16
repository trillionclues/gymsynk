**GymSynk**

_Open-Source Gym Management Platform_

Licensed under AGPL-3.0

**Product Requirements Document**

Core Platform Specification - v1.0

Version 1.0.0 | Public Draft

Spring Boot 3.4 • Java 21 • Next.js 15 • PostgreSQL 16

Generated: 9 June 2026

# 1\. Executive Summary

GymSynk is a self-hosted, open-source gym management platform licensed under AGPL-3.0. It replaces the informal 'the cashier knows everyone' verification model with a structured digital system - while keeping the human override and control that gym operators prefer.

GymSynk is not a SaaS competitor to GymMaster or Mindbody. It is a deployable infrastructure tool that any gym operator hosts on their own server, owns entirely, and extends freely. Anyone who hosts a fork commercially must contribute back under AGPL.

**Unique Selling Point**

Single-command Docker Compose deploy. No vendor lock-in. No per-seat pricing. No cloud dependency. Full data ownership. Open source forever.

## 1.1 Problem Statement

The cashier at a typical small gym manually remembers which members are on weekly, monthly, or daily plans and verifies attendance from memory. This is:

- Fragile - breaks entirely when that person is absent
- Unscalable - impossible to manage beyond ~50 active members reliably
- Unauditable - no check-in history, no attendance data, no revenue trail
- Member-unfriendly - attendees have no visibility into their own plan or expiry status
- Decision-blind - gym owner has no data on peak hours, churn, or renewal rates

## 1.2 Solution

A cashier portal for registration, plan management, and real-time check-in monitoring - plus a member-facing PWA with a scannable QR code. The cashier remains in control; the system gives her the tools to exercise that control with precision and an audit trail.

# 2\. Users & Roles

GymSynk v1 ships with three roles enforced at the API layer via Spring Security method-level annotations - not just the UI.

| **Role** | **Who It Serves**    | **Core Permissions**                                                                                                         |
| -------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| ADMIN    | Gym owner or manager | Full access: gym config, member management, plan pricing, payment settings, reports, staff management, audit logs            |
| CASHIER  | Front desk staff     | Register members, assign plans, log/process payments, manual check-in, scan QR, view member status - no config or financials |
| MEMBER   | Gym attendee         | View own profile, active plan, expiry date, check-in history - self check-in via QR scan                                     |

**Planned v1.5 Role: FLOOR_STAFF**

Read-only + can scan/check-in a member. For trainers who verify attendance but must not touch registration or payments. Schema and permission enum include this role from day 1.

# 3\. Membership Plans

Plans are defined per-location in the database and fully configurable from the admin portal. The following are reference defaults based on the target gym:

| **Plan Type** | **Default Duration** | **Valid Days**     | **Sessions**         | **Default Price (NGN)** |
| ------------- | -------------------- | ------------------ | -------------------- | ----------------------- |
| DAILY         | 1 day                | Any day            | 1 session (AM or PM) | 5,000                   |
| WEEKLY        | 7 days               | Fri, Sat, Sun only | All 3 days AM + PM   | 10,000                  |
| MONTHLY       | 28 days (4 weeks)    | All days           | Unlimited AM + PM    | 20,000                  |
| CUSTOM        | Admin-defined        | Admin-defined      | Admin-defined        | Admin-defined           |

All prices, durations, valid days, and session allowances are stored in the membership_plans table per location. Nothing is hardcoded. Currency defaults to NGN but is configurable per organization during setup.

# 4\. Core Features

## 4.1 Member Registration

- Cashier registers a new member via the portal dashboard
- Required fields: first name, last name, phone number, plan, payment method, start date
- Optional fields: email, date of birth, gender, emergency contact - configurable
- Profile photo: **no file upload** — member avatar is auto-generated from name initials via DiceBear. No storage required.
- System auto-computes end_date from plan duration_type and duration_value
- Member gets a unique member number (GS-XXXXX) and access to the member PWA on their phone
- Audit log entry created on every registration

## 4.2 QR Check-In Flow

This is the primary attendance mechanism. The QR token is opaque - it contains no PII, just a cryptographically random 64-character hex string stored in Redis with a 120-second TTL.

- Member opens GymSynk PWA on their phone (saved to home screen)
- Member taps 'Check In' - PWA requests a fresh QR token from the API (POST /api/v1/checkin/qr-token)
- API generates a random token, stores it in Redis (key: qr:token:{token} → user_id, TTL: 120s), renders QR PNG via ZXing
- Member presents QR at the entrance - cashier scans using the portal's camera view
- API validates: token exists in Redis, not used, membership active, session slot valid for plan
- On valid: check-in record written to Postgres, token invalidated in Redis, WebSocket event emitted to cashier dashboard
- On expired/invalid: blocked status returned, cashier dashboard shows alert with member name and expiry details
- Cashier makes the human decision: override with reason, redirect to renewal, or deny

**Why Redis Opaque Tokens (not JWT QR)**

A JWT QR encodes the user ID - anyone who captures the QR image can decode the member's identity. An opaque Redis token is meaningless without server-side lookup. Single-use + 120s TTL means a photographed QR is useless by the time it could be replayed.

Cashier can also scan a member's QR directly from the cashier portal's built-in @zxing/browser camera view - for members who don't have their phone on them.

## 4.3 Session Segmentation

- Each gym day is divided into two sessions: MORNING and EVENING
- Session times configured per day-of-week in the operating_hours table
- Check-in session type is computed from check_in_time + org timezone - no manual selection
- WEEKLY plan: sessions valid only on configured allowed_days (e.g. FRIDAY=5, SATURDAY=6, SUNDAY=0)
- max_checkins_per_day enforced per membership plan - prevents double morning check-in on daily plans
- Check-in history shows date, session (MORNING/EVENING), method, and status

## 4.4 Payment System

Three modes, selected at setup and changeable from admin settings. Implemented as a Strategy Pattern in Spring - swapping modes requires only a config change, no code changes.

| **Mode**          | **Description**                                                                                  | **What Gets Recorded**                               |
| ----------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| CASH_ONLY         | Cashier logs payment manually. No processing.                                                    | Amount, method, date, cashier ID                     |
| TRACK_AND_RECEIPT | Log payment + auto-generate PDF receipt via iText on-demand. Receipt is **streamed as HTTP response, never stored on disk**. Email to member if email on file. | All of above + receipt_number |
| FULL_PROCESSING   | Gateway-hosted redirect only — no direct card entry through the portal. LemonSqueezy is the reference implementation (existing integration reused from Mockline). Paystack is the secondary implementation for the NGN market. Payment link sent to member or displayed for cashier. Webhook confirms. | All of above + external_ref + gateway transaction ID |

Money amounts stored as DECIMAL(12,4) in minor units - avoids float precision issues for any currency. Default currency is NGN, configurable per organization.

## 4.5 Cashier Dashboard

- Live check-in feed via WebSocket - member photo, name, plan badge, session, valid/expired status
- Today's stats strip: total check-ins, morning count, evening count, new registrations
- Expiry alerts panel - members expiring within 7 days
- Member search: by name, phone, or member number - debounced, server-side paginated
- Member profile drawer: plan status, expiry, payment history, check-in history, manual check-in button
- QR scanner tab using device camera (@zxing/browser) - works on any phone or tablet

## 4.6 Admin Dashboard

- All cashier features plus: revenue analytics, staff management, gym settings
- Attendance heatmap - hour-of-day vs day-of-week grid showing peak times
- Revenue charts: daily/weekly/monthly by plan type (Recharts)
- Member retention data - renewal rates, churn by plan
- Staff activity log - per-cashier check-in and registration counts
- Full audit log access - every write action with actor, before/after values
- CSV export: members, check-ins, payments - filterable by date range

## 4.7 Member PWA

- Login via phone number + OTP (6-digit code via Email - no password to remember)
- Home screen: tap to generate QR, plan badge with days remaining, member number
- QR is generated fresh on each tap - valid for 120 seconds, single-use
- Check-in history: paginated list with date, session slot, and validity status
- Profile: name, photo, plan details, expiry date, renewal prompt at 5 days
- Installable as home screen app via PWA manifest + Serwist service worker
- Offline fallback: static member card screen (name + member number) when network unavailable - cashier does manual lookup

# 5\. Non-Functional Requirements

## 5.1 Performance

| **Metric**                | **Target**             | **Notes**                                                                      |
| ------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| QR check-in validation    | < 200ms p99            | Redis token lookup + single DB write                                           |
| WebSocket check-in update | < 1s to cashier screen | Redis pub/sub → WebSocket push                                                 |
| Member list search        | < 300ms                | Indexed full-text search on name/phone/number                                  |
| Dashboard page load       | < 2s                   | SSR first paint; analytics pre-aggregated nightly                              |
| Concurrent check-ins      | 50+ simultaneous       | Java 21 virtual threads handle I/O-bound bursts without thread pool exhaustion |

## 5.2 Reliability & Offline

- Cashier portal operates in degraded network: offline check-ins queued in IndexedDB, synced via Background Sync API when connectivity returns
- QR token validation is atomic - Redis GETDEL ensures single-use even under concurrent scans
- Database writes for check-ins are transactional - no partial records
- Membership expiry status computed at check-in time, not cached - always accurate

## 5.3 Security

- All API routes protected by Spring Security + JWT (access: 15 min, refresh: 7 days in Redis whitelist)
- Role-based access via @PreAuthorize annotations at service layer - not just controller layer
- QR tokens are opaque random hex - no PII decodable from the QR image
- Single-use QR tokens: Redis GETDEL makes replay attacks impossible
- Passwords hashed with BCrypt (Spring Security default, cost factor 12)
- OTP tokens stored in Redis with 5-minute TTL, rate-limited per phone number
- All mutation actions written to audit_log with actor ID and IP address
- AGPL license: anyone hosting a fork must publish their source

## 5.4 Scalability

- Single VPS (2 vCPU, 2 GB RAM) handles 5,000+ members and 200 concurrent morning check-ins comfortably
- Virtual threads (Java 21) - no thread pool exhaustion under I/O-bound check-in bursts
- Multi-location schema from day 1 - organizations → locations hierarchy baked in
- check_ins table partitioned by range on check_in_time for high-volume deployments (documented, optional)
- Stateless API design - horizontal scaling requires only an external DB and Redis

## 5.5 Internationalisation

- All timezone-sensitive logic (session computation, expiry) uses org.timezone stored as IANA string (e.g. Africa/Lagos)
- Currency configurable per organization - stored as ISO 4217 code, amounts as DECIMAL(12,4)
- UI i18n-ready with next-intl - English ships in v1, Yoruba/French in roadmap

# 6\. Open Source & Licensing

**License: GNU AGPL-3.0**

GymSynk is fully open source under AGPL-3.0. Any person or organization that hosts GymSynk or a modified version of it as a network service must make their complete source code available under the same license. This prevents commercial forks from benefiting without contributing back.

There is no premium tier. All features - including multi-location UI, analytics, payment gateway integrations, and white-label support - are open source. The project's sustainability model is: reputation, consulting, and optional paid hosting for operators who don't want to self-host.

| **What you can do**                  | **License requirement**                                   |
| ------------------------------------ | --------------------------------------------------------- |
| Self-host for your gym for free      | None - just use it                                        |
| Modify the source for your gym       | None - private modification is fine                       |
| Host GymSynk as a service for others | Must publish full source of your modifications under AGPL |
| Fork and redistribute                | Must keep AGPL license and publish source                 |
| Contribute features back             | Welcomed and credited                                     |

# 7\. Roadmap

| **Feature**                                | **Phase** | **Status**                                         |
| ------------------------------------------ | --------- | -------------------------------------------------- |
| Core check-in + cashier portal             | v1.0      | In spec                                            |
| Member PWA + QR flow                       | v1.0      | In spec                                            |
| CASH_ONLY payment mode                     | v1.0      | In spec                                            |
| First-run setup wizard + Docker stack      | v1.0      | In spec                                            |
| TRACK_AND_RECEIPT payment mode             | v1.1      | Planned — strategy interface ready from v1.0       |
| FULL_PROCESSING payment mode (LemonSqueezy / Paystack) | v1.1 | Planned — strategy interface ready from v1.0 |
| Admin analytics dashboard                  | v1.1      | Planned                                            |
| Staff management + audit log viewer        | v1.1      | Planned                                            |
| CSV export (members, check-ins, payments)  | v1.1      | Planned                                            |
| Offline sync (IndexedDB + Background Sync) | v1.1      | Planned                                            |
| FLOOR_STAFF role                           | v1.5      | Planned — schema ready from v1.0                   |
| Push notifications (plan expiry)           | v1.5      | Planned                                            |
| Membership freeze/pause                    | v1.5      | Planned                                            |
| SMS OTP delivery (Termii / Twilio)         | v1.5      | Planned — email-only in v1.0                       |
| Multi-location management UI               | v2.0      | Schema ready — UI deferred                         |
| Class/session booking                      | v2.0      | Separate product surface                           |
| Mobile native wrapper (Capacitor/TWA)      | v2.0      | PWA covers v1/v1.5 use cases                       |
| K8s Helm charts                            | v2.0      | Docker Compose is the primary deploy target        |