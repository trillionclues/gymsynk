**GymSynk**

_Open-Source Gym Management Platform_

Licensed under AGPL-3.0

**Workflow Guide**

Operational Workflows for Staff, Members, and Admins

Version 1.0.0 | Operational Reference

Spring Boot 3.4 • Java 21 • Next.js 15 • PostgreSQL 16

Generated: 11 June 2026

---

# 1. Overview

This document describes the end-to-end operational workflows for each actor in GymSynk: the cashier, the admin, and the member. It covers the day-to-day sequences a real gym would follow, from first deployment through daily operations.

---

# 2. First-Time Deployment Workflow

This runs once — when a gym operator deploys GymSynk for the first time.

```
Operator clones repo
        │
        ▼
./setup-cli.sh
        │ (auto-generates POSTGRES_PASSWORD, REDIS_PASSWORD, JWT_SECRET)
        │ (prompts: DOMAIN, ACME_EMAIL, SMTP_PASSWORD, PAYMENT_MODE)
        │ (writes .env, starts docker compose)
        │
        ▼
Browser opens to https://{DOMAIN}/setup
        │
        ▼
Step 1: Gym Details
  → Enter org name (avatar auto-generated from initials)
  → Select timezone (e.g. Africa/Lagos)
  → Select default currency (e.g. NGN)
        │
        ▼
Step 2: Location
  → Branch name, address, phone number
        │
        ▼
Step 3: Operating Hours
  → Toggle which days are open
  → Set morning session open/close times per day
  → Set evening session open/close times per day
        │
        ▼
Step 4: Payment Mode
  → CASH_ONLY       (log payments manually, no receipts)
  → TRACK_AND_RECEIPT (log + generate PDF receipt on-demand, email if member has email)
  → FULL_PROCESSING  (LemonSqueezy or Paystack — gateway-hosted redirect only, enter API keys)
        │
        ▼
Step 5: Membership Plans
  → Review pre-filled templates: Daily / Weekly / Monthly
  → Edit plan names, prices, allowed days, session allowances
  → Add CUSTOM plan if needed
        │
        ▼
Step 6: Admin Account
  → Enter admin email and password
  → POST /api/v1/setup → org.setup_complete = true
        │
        ▼
Redirected to https://{DOMAIN}/dashboard/login
Setup wizard permanently disabled
```

---

# 3. Cashier Daily Workflow

## 3.1 Start of Day

```
Cashier opens browser → https://{DOMAIN}/dashboard
        │
        ▼
Login with email + password
        │
        ▼
Dashboard loads:
  - Today's check-in count (0 at start)
  - Expiry alerts panel (members expiring within 7 days)
  - Live check-in feed (WebSocket connected, waiting)
```

## 3.2 Registering a New Member

```
Cashier clicks "Register Member"
        │
        ▼
Step 1: Personal Info
  → First name, last name (avatar auto-generated from initials)
  → Phone number (required)
  → Email (optional — needed for receipt emails and OTP login)
  → Date of birth, gender, emergency contact (optional)
        │
        ▼
Step 2: Plan Selection
  → Plan cards fetched from API for this location
  → Select Daily / Weekly / Monthly / Custom
  → Confirm start date (defaults to today)
  → End date auto-computed from plan duration
        │
        ▼
Step 3: Payment
  → Enter amount (pre-filled from plan price)
  → Select method: Cash / Card / Transfer / Online
  → Add notes if needed
  → If TRACK_AND_RECEIPT mode: receipt auto-generated and emailed to member
        │
        ▼
Step 4: Confirmation
  → Member number assigned: GS-XXXXX
  → Member can now log in to PWA via email OTP
  → Print member card option (browser print dialog)
        │
        ▼
Member appears in member list with ACTIVE status
Audit log entry created
```

## 3.3 QR Check-In (Primary Flow)

```
Member opens GymSynk PWA on their phone
        │
        ▼
Member taps "Check In" → QR appears (120s countdown)
        │
        ▼
Cashier scans QR via portal camera (check-in/scanner page)
OR member presents phone to cashier who uses portal camera
        │
        ▼
Result appears on cashier scanner screen for 3 seconds:

  VALID (green):        Check-in recorded, member appears in live feed
  EXPIRED_PLAN (red):   Membership expired — renew option shown
  WRONG_SESSION (yellow): Member's plan not valid for current session
  WRONG_DAY (yellow):   Member's plan not valid for today (e.g. Weekly plan on weekday)
  ALREADY_CHECKED_IN:   Member already checked in this session
  TOKEN_EXPIRED:        QR has expired — ask member to generate new one
        │
        ▼
Scanner auto-resets to camera view, ready for next scan
```

## 3.4 Manual Check-In (No Phone / QR Issue)

```
Cashier searches member by name, phone, or member number
        │
        ▼
Clicks member → Profile drawer opens
        │
        ▼
"Check In" button → Session selector (MORNING / EVENING)
        │
        ▼
System validates: active membership, session, day, duplicate
        │
        ├─► Valid → check-in recorded (method=MANUAL)
        │
        └─► Expired → Override option shown
               → Cashier enters override reason
               → POST /api/v1/checkin/manual with X-Override: true
               → Check-in recorded (status=OVERRIDE)
               → Audit log: override_by, override_reason
```

## 3.5 Renewing a Membership

```
Cashier opens member profile (search or expiry alerts panel)
        │
        ▼
Clicks "Renew Membership"
        │
        ▼
Plan selector → confirm same plan or switch
        │
        ▼
Payment step (same as registration Step 3)
        │
        ▼
New membership record created, status=ACTIVE
Previous membership record: status=EXPIRED (unchanged)
Member's PWA reflects new expiry date immediately
```

---

# 4. Member PWA Workflow

## 4.1 First Login

```
Member opens browser on phone → https://{DOMAIN}/member
  (or launches installed PWA from home screen)
        │
        ▼
Prompted to log in
        │
        ▼
Enter email address (must match what cashier registered)
        │
        ▼
6-digit OTP sent to email via Resend
        │
        ▼
Enter OTP code → verified → JWT issued
        │
        ▼
PWA home screen:
  - Member's avatar (DiceBear, initials-based)
  - Member number (GS-XXXXX)
  - Plan type badge + days remaining
  - "Check In" button
```

## 4.2 Installing to Home Screen

```
Android (Chrome):
  → Tap browser menu → "Add to Home Screen" → "Install"
  → GymSynk icon appears on home screen
  → Opens in standalone mode (no browser chrome)

iOS (Safari):
  → Tap Share → "Add to Home Screen"
  → Opens as standalone PWA
```

## 4.3 Daily Check-In

```
Member opens PWA → taps "Check In"
        │
        ▼
POST /api/v1/checkin/qr-token
        │
        ▼
QR displayed at 280×280px
Countdown timer: 120s
        │
        ▼
Member presents QR to cashier (or holds up to scanner)
        │
        ▼
Token validated → screen updates:
  ✅ Checked in successfully
  ❌ Membership expired — contact cashier
  ⚠️  Wrong session / day
        │
        ▼
Tap "Check In" again for fresh token (manual reset or after 120s expiry)
```

## 4.4 Offline Fallback

```
Member has no internet signal at gym entrance:
        │
        ▼
QR token request fails (network error)
        │
        ▼
PWA shows static member card from service worker cache:
  - Name
  - Member number (GS-XXXXX)
  - Plan type + cached expiry date
  - "Show this to the cashier for manual check-in"
        │
        ▼
Cashier does manual lookup by member number → manual check-in
```

---

# 5. Admin Workflow

## 5.1 Daily Monitoring

```
Admin logs in → Dashboard
        │
        ▼
Review:
  - Today's check-in stats (total, morning, evening, new registrations)
  - Expiry alerts (members within 7 days)
  - Revenue summary for today
  - Any failed check-in spikes (indicator of config/plan issues)
```

## 5.2 Managing Membership Plans

```
Admin → Plans page
        │
        ▼
Edit plan:
  → Change price (effective immediately for new memberships)
  → Change allowed days (e.g. expand Weekly plan from Fri/Sat/Sun to Mon-Sun)
  → Toggle plan active/inactive (inactive plans hidden from cashier registration form)
        │
        ▼
Add new plan:
  → Select CUSTOM duration type
  → Set duration value (e.g. 14 days)
  → Set allowed days, sessions, max check-ins per day
  → Set price
```

## 5.3 Reviewing Analytics

```
Admin → Analytics page
        │
        ▼
Attendance Heatmap:
  → 7×24 grid: day of week × hour of day
  → Color intensity shows peak attendance times
  → Use to optimize cashier schedules and session times

Revenue Charts:
  → Daily revenue bar chart (last 30 days)
  → Breakdown by plan type (Daily / Weekly / Monthly)
  → Month-to-date totals

Member Retention:
  → Renewal rate by plan type
  → Churn trend (expired memberships not renewed)
```

## 5.4 Staff Management

```
Admin → Settings → Staff
        │
        ▼
Invite cashier:
  → Enter name + email
  → System creates CASHIER user, sends login email
  → Cashier logs in with email + temp password

Deactivate cashier:
  → Toggle is_active = false
  → Cashier's JWT is not revoked immediately (expires within 15 min)
  → Refresh token is revoked: DEL from Redis whitelist
```

## 5.5 Audit Log Review

```
Admin → Settings → Audit Log
        │
        ▼
Filterable by:
  → Action type (MEMBER_CREATED, PAYMENT_RECORDED, CHECK_IN, PLAN_MODIFIED, OVERRIDE, etc.)
  → Actor (which cashier/admin performed the action)
  → Date range

Expandable rows show:
  → Before/after JSON diff for mutations
  → IP address of actor
  → Timestamp (displayed in org timezone)

Use cases:
  → Investigate unauthorized membership changes
  → Verify override check-ins were legitimate
  → Audit payment discrepancies
```

## 5.6 Data Export

```
Admin → Members page → "Export CSV"
  → All members with plan status, expiry, last check-in

Admin → Payments page → "Export CSV"
  → All payments filtered by date range

Admin → Check-ins page → "Export CSV"
  → All check-in events filtered by date range and status
```

---

# 6. Payment Workflow by Mode

## CASH_ONLY

```
Cashier selects plan → enters amount → selects "Cash"
        │
        ▼
POST /api/v1/payments
  → Payment record created (status=COMPLETED)
  → Membership activated
  → No receipt generated
  → No email sent
```

## TRACK_AND_RECEIPT

```
Cashier records payment (same as above)
        │
        ▼
API calls TrackAndReceiptStrategy:
  → iText generates PDF receipt in memory (byte[])
  → receipt_number assigned (unique, e.g. RCP-2026-00001)
  → If member.email present:
      → PDF attached to email
      → Sent via Resend/SMTP
        │
        ▼
Cashier can also download receipt anytime:
  GET /api/v1/payments/{id}/receipt
  → PDF generated on-demand from payment record
  → Streamed as Content-Type: application/pdf
  → Never written to disk
```

## FULL_PROCESSING

```
Cashier selects plan → clicks "Collect Payment Online"
        │
        ▼
API calls FullProcessingStrategy:
  → LemonSqueezy (reference) or Paystack (NGN) initializes transaction
  → Returns hosted payment URL
        │
        ▼
Option A — Member pays on their phone:
  → Cashier shares payment link with member (via display or copy)
  → Member completes payment on gateway's hosted checkout page

Option B — Cashier opens link on portal device:
  → Cashier opens the hosted payment URL on the desk tablet/browser
  → Member provides payment details directly on the gateway's hosted page
  → No card details ever pass through the GymSynk portal
        │
        ▼
Gateway sends webhook → POST /api/v1/payments/webhook/{gateway}
  → API verifies webhook signature
  → Updates payment status to COMPLETED
  → Activates membership
  → Sends receipt email if TRACK_AND_RECEIPT also enabled
```

---

# 7. WebSocket Real-Time Feed

```
Cashier dashboard loads
        │
        ▼
useWebSocket hook:
  → Connects to /ws (SockJS + STOMP)
  → Subscribes to /topic/checkins/{orgId}
        │
        ▼
On check-in event received:
  → CheckInCard prepended to live feed (max 50 items)
  → Card shows: avatar, name, member number, plan badge, session, status badge
  → Stats strip increments in real-time
        │
        ▼
If WebSocket disconnects:
  → Auto-reconnect with exponential backoff (1s, 2s, 4s, max 30s)
  → Feed shows "Reconnecting..." indicator
  → Missed events are not replayed (by design — cashier sees live, not history)
```

---

# 8. Offline Sync Workflow (Cashier Portal)

```
Network drops while cashier is working
        │
        ▼
Cashier performs manual check-ins (searches cached member list)
  → check-in stored in IndexedDB with synced=false and timestamp
  → UI shows "Offline — X check-ins queued"
        │
        ▼
Network restored
        │
        ▼
Background Sync API fires (navigator.serviceWorker.sync)
  → Handler: POST /api/v1/checkin/sync with batch of pending check-ins
        │
        ▼
Server reconciles each check-in:
  → Check for duplicate: (user_id, location_id, session_type, DATE(check_in_time))
  → Duplicate found: mark as CONFLICT in response, skip insert
  → No duplicate: insert normally (synced=true)
        │
        ▼
Client receives sync response:
  → Clears synced items from IndexedDB
  → Shows sync summary: "X check-ins synced, Y conflicts"
  → Conflicts logged to admin audit view
```

---

# 9. Membership Expiry Workflow

## Automated (Backend Scheduler)

```
MembershipExpiryScheduler — runs every hour
        │
        ▼
Query: SELECT * FROM memberships WHERE status='ACTIVE' AND end_date < NOW()
        │
        ▼
Batch UPDATE status='EXPIRED'
Each transition logged to audit_log
        │
        ▼
ExpiryWarningEmailJob — runs daily at 8 AM (org timezone)
        │
        ▼
Query: memberships WHERE status='ACTIVE' AND end_date = today + 5 days
        │
        ▼
For each: send email to member (if email on file)
  Subject: "Your GymSynk membership expires in 5 days"
  Body: plan name, expiry date, gym contact info, renewal CTA
```

## Member-Facing (PWA)

```
Member opens PWA
        │
        ▼
If days_remaining <= 5:
  → Yellow renewal banner shown on home screen and profile
  → "Contact your gym to renew" CTA
  → member cannot self-renew in v1 (cashier processes renewal)
```

## At Check-In

```
Expired member scans QR:
        │
        ▼
API: membership.end_date < LocalDate.now(orgTz) → EXPIRED_PLAN
  → Check-in record written with status=EXPIRED_PLAN
  → Response: member name + expiry date + "Contact cashier to renew"
  → Cashier dashboard: red alert card with "Renew" button
        │
        ▼
Cashier clicks "Renew" → inline renewal flow (same as section 3.5)
```
