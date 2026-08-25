# Changelog

All notable changes to GymSynk are documented here, categorized by major system component and feature area.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — Feature Highlights & System Capabilities

### 1. First-Run Setup Wizard & Organization Onboarding
- **6-Step Setup Flow (`/setup`)**: Complete guided onboarding for new gym installations covering Gym Details, Location, Operating Hours, Payment Strategy, Plans, and Admin Credentials.
- **OpenStreetMap (OSM) Live Geocoding**: Integrated Nominatim API for real-time address autocomplete and location verification without third-party API key fees.
- **GPS Precision & Geofencing**: Automatic capture of exact GPS coordinates (`latitude`, `longitude`), `city`, `country`, and OSM `place_id`, with interactive geofence radius configuration (`50m`, `100m`, `250m`, `500m`).
- **World Currency Selection**: Searchable `<CurrencySheetModal>` supporting 160+ world currencies complete with flag emojis, symbols, and ISO codes.
- **Gateway Credential Provisioning**: Step 4 inline unlocking for `FULL_PROCESSING` payment gateways (Paystack & LemonSqueezy) with test/live public keys, secret keys, and webhook secrets.

### 2. Unified UI Component System & Sheet Primitives
- **Gesture-Friendly `<BottomSheet>`**: Mobile & desktop modal primitive featuring swipe-to-close touch delta tracking, backdrop blur, body scroll locking, and mobile drag handle pill.
- **Searchable `<SheetSelect>`**: Touch-friendly dropdown picker component with instant filtering and custom icons/badges, replacing native browser `<select>` elements.
- **Calendar `<DateRangeSheetModal>`**: Custom date range picker bottom-sheet with quick presets (**Last 7 Days**, **14 Days**, **30 Days**) and a strict 30-day range boundary constraint.

### 3. Role-Based Access Control (RBAC) & Security
- **Dynamic Sidebar Navigation**: Sidebar automatically filters visible routes based on `user.role` (`ADMIN` vs `CASHIER`).
- **Route Authorization Enforcement**: Cashier role restricted from accessing financial configuration, staff management, analytics, and audit logs.
- **Read-Only Portal Interfaces**: Cashiers viewing Plans (`/dashboard/plans`) or Staff (`/dashboard/staff`) see a clean read-only interface with administrative creation/editing actions hidden.
- **Spring Security Integration**: `@PreAuthorize` method security annotations across all REST endpoints enforcing `ROLE_ADMIN` vs `ROLE_CASHIER`.

### 4. Admin Portal Sections (Phase 2.6)
- **Plans Management (`/dashboard/plans`)**: Complete CRUD operations for membership plans, pricing tiers, duration types, allowed sessions, and active/inactive status toggling.
- **Staff Management (`/dashboard/staff`)**: Staff invitation flow, system role assignment (`ADMIN`, `CASHIER`, `FLOOR_STAFF`), and account deactivation.
- **Payments Log (`/dashboard/payments`)**: Paginated transaction history with member name resolution, currency formatting, external reference tracking, and payment status filter chips (`COMPLETED`, `PENDING`, `FAILED`, `REFUNDED`).
- **Analytics Dashboard (`/dashboard/analytics`)**: Interactive Recharts Attendance Area Chart, Revenue Bar Chart, and 7×24 Peak Density Heatmap grid analyzing check-in volume by day of week and hour of day.
- **Audit Trail (`/dashboard/audit`)**: Filterable security activity log with expandable JSON payload diff viewer for system action auditing.

### 5. Backend Architecture & Database Migrations
- **Spring Boot 3.4 (Kotlin)**: Kotlin REST controllers and query services using virtual threads for I/O operations.
- **Payment Strategy Pattern**: Strongly-typed strategy handlers (`PaystackPaymentStrategy`, `LemonSqueezyPaymentStrategy`) for checkout URL generation and direct active verification fallbacks.
- **Flyway Database Migrations (V1–V12)**: Database migrations including audit logging (`V10`), member number sequence (`V11`), and location precision columns (`V12`).

---

## Versioning Policy

- **Patch** (`1.0.x`) — bug fixes, security patches, documentation corrections. No API or schema changes.
- **Minor** (`1.x.0`) — new features, additive API changes, additive schema migrations. Backwards compatible.
- **Major** (`x.0.0`) — breaking changes: schema column drops/renames, API breaking changes.
