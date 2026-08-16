# GymSynk — Phase 0 & 1 Build Guide

**From current scaffold to end-to-end QR check-in working locally.**

Stack: Spring Boot 4.1 · Kotlin 2.3 · Next.js 15 · PostgreSQL 16 · Redis 7

This is the single document you need during Phase 0 and Phase 1.
Each section has a concrete exit check — don't move on until it passes.

---

## Current state (as of this guide)

Already done — do not redo these:

| Item | Status |
|:-----|:-------|
| `apps/api` Spring Boot scaffold | ✅ Done |
| `build.gradle.kts` with all deps | ✅ Done |
| `application.yml` + `application-dev.yml` | ✅ Done |
| Flyway migrations V1–V10 | ✅ Done |
| `GymSynkApplication.kt` | ✅ Done |
| `DataSeeder.kt` (stubbed) | ✅ Done — fill in after entities |
| `docker-compose.dev.yml` | ✅ Done |
| `pnpm-workspace.yaml` + root `package.json` | ✅ Done |
| `apps/web` Next.js scaffold | ✅ Done |
| `src/lib/api.ts` | ⚠️ Exists but has a bug — fix in Phase 0 Step 1 |

Still to build:

- Fix `api.ts` interceptor bug
- `authStore.ts` Zustand store
- Design system CSS + Tailwind config
- `V11` migration (member number sequence)
- All Kotlin package structure + entities + services + controllers
- WebSocket config + Redis pub/sub bridge
- Phase 0 + Phase 1 exit checks

---

## Phase 0 — Finish the foundation

### Step 1 — Fix api.ts

The current `api.ts` has a structural bug — the response interceptor is nested inside the request interceptor's callback instead of being a separate call. Replace the entire file:


```typescript
// apps/web/src/lib/api.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
  withCredentials: true,  // sends httpOnly refresh token cookie
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 — try one silent refresh, then redirect to login
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}/api/v1/auth/refresh`,
          {},
          { withCredentials: true },
        );
        useAuthStore.getState().setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().clearSession();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
```

### Step 2 — authStore.ts

```typescript
// apps/web/src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'ADMIN' | 'CASHIER' | 'MEMBER';

interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  orgId: string;
}

interface AuthState {
  accessToken: string | null;
  user: SessionUser | null;
  setSession: (token: string, user: SessionUser) => void;
  setAccessToken: (token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setSession: (accessToken, user) => set({ accessToken, user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearSession: () => set({ accessToken: null, user: null }),
    }),
    {
      name: 'gymsynk-auth',
      // Don't persist the token — memory only. User metadata persists.
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
```

### Step 3 — Design system

Copy the full `globals.css` and `tailwind.config.ts` from `GymSynk_Design_System.md` into:
- `apps/web/src/styles/globals.css` (replace the generated one)
- `apps/web/tailwind.config.ts` (replace the generated one)

Add the `ThemeProvider` from that doc to `apps/web/src/components/ThemeProvider.tsx`,
then wrap `apps/web/src/app/layout.tsx` with it:

```tsx
// apps/web/src/app/layout.tsx
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevents flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){var s=localStorage.getItem('gymsynk-theme');
          var d=window.matchMedia('(prefers-color-scheme:dark)').matches;
          var r=s==='dark'||((!s||s==='system')&&d)?'dark':'light';
          document.documentElement.classList.add(r);})();
        `}} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 4 — V11 migration (member number sequence)

```sql
-- apps/api/src/main/resources/db/migration/V11__create_member_number_seq.sql
CREATE SEQUENCE IF NOT EXISTS member_number_seq
    START 1
    INCREMENT 1
    NO MAXVALUE
    CACHE 1;
```

### Step 5 — app.jwt.secret in dev config

Add to `apps/api/src/main/resources/application-dev.yml`:

```yaml
app:
  jwt:
    secret: dev-secret-gymsynk-change-in-production-32chars
  qr:
    token-ttl-seconds: 120
  otp:
    ttl-seconds: 300
    max-requests-per-10min: 3
```

### Phase 0 exit check

```bash
# 1. Containers up
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml ps
# Both db and redis show healthy

# 2. API starts, all 11 migrations apply
cd apps/api
./gradlew bootRun --args='--spring.profiles.active=dev'
# Console: "Successfully applied 11 migrations to schema"
# curl http://localhost:8080/api/v1/actuator/health  →  {"status":"UP"}

# 3. Frontend starts
cd ../..
pnpm dev:web
# Ready on http://localhost:3000

# 4. All tables + sequence exist
docker exec -it $(docker ps -qf name=db) psql -U gymsynk -c "\dt"
# Shows: organizations, locations, operating_hours, users,
#        membership_plans, memberships, payments, check_ins, qr_tokens, audit_log
docker exec -it $(docker ps -qf name=db) psql -U gymsynk -c "\ds"
# Shows: member_number_seq
```

Do not start Phase 1 until all four pass.

---

## Phase 1 — Backend API Core

Build in this order. Each layer depends on the one above it.

### 1.1 Create package structure

```bash
cd apps/api/src/main/kotlin/com/gymsynk
mkdir -p common/{exception,audit,util} \
         auth/dto \
         organization/{entity,dto} \
         location/entity \
         member/{entity,dto,repository} \
         membership/{entity,dto,repository} \
         checkin/{entity,dto,repository,websocket} \
         payment/{entity,dto,strategy} \
         analytics/dto
```

### 1.2 Common — exceptions and error handling

```kotlin
// common/exception/BusinessException.kt
package com.gymsynk.common.exception

class BusinessException(
    val code: String,
    message: String,
    val httpStatus: Int = 400,
) : RuntimeException(message)

object ErrorCodes {
    const val TOKEN_INVALID      = "TOKEN_INVALID"
    const val TOKEN_EXPIRED      = "TOKEN_EXPIRED"
    const val MEMBER_NOT_FOUND   = "MEMBER_NOT_FOUND"
    const val MEMBERSHIP_EXPIRED = "EXPIRED_PLAN"
    const val WRONG_SESSION      = "WRONG_SESSION"
    const val WRONG_DAY          = "WRONG_DAY"
    const val ALREADY_CHECKED_IN = "ALREADY_CHECKED_IN"
    const val UNAUTHORIZED       = "UNAUTHORIZED"
}
```

```kotlin
// common/exception/GlobalExceptionHandler.kt
package com.gymsynk.common.exception

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

data class ErrorResponse(val code: String, val message: String)

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException::class)
    fun handleBusiness(ex: BusinessException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(ex.httpStatus).body(ErrorResponse(ex.code, ex.message ?: ex.code))

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val msg = ex.bindingResult.fieldErrors.joinToString(", ") { "${it.field}: ${it.defaultMessage}" }
        return ResponseEntity.badRequest().body(ErrorResponse("VALIDATION_ERROR", msg))
    }
}
```

### 1.3 Security config

```kotlin
// config/SecurityConfig.kt
package com.gymsynk.config

import com.gymsynk.auth.JwtAuthFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig(private val jwtAuthFilter: JwtAuthFilter) {

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests {
                it.requestMatchers(
                    "/auth/**", "/setup", "/actuator/**",
                    "/swagger-ui/**", "/v3/api-docs/**",
                ).permitAll()
                it.anyRequest().authenticated()
            }
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter::class.java)
        return http.build()
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder(12)
}
```

### 1.4 JWT service and filter

```kotlin
// auth/JwtService.kt
package com.gymsynk.auth

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Date
import java.util.UUID
import javax.crypto.SecretKey

@Service
class JwtService(@Value("\${app.jwt.secret}") secret: String) {

    private val key: SecretKey = Keys.hmacShaKeyFor(secret.toByteArray())
    private val accessTtlMs  = 15 * 60 * 1000L
    private val refreshTtlMs = 7 * 24 * 60 * 60 * 1000L

    fun generateAccessToken(userId: UUID, role: String, orgId: UUID): String =
        Jwts.builder()
            .subject(userId.toString())
            .claim("role", role)
            .claim("orgId", orgId.toString())
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + accessTtlMs))
            .signWith(key)
            .compact()

    fun generateRefreshToken(): String = UUID.randomUUID().toString()

    fun validateAndExtract(token: String): Claims =
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token).payload

    fun getUserId(token: String): UUID = UUID.fromString(validateAndExtract(token).subject)
    fun getOrgId(token: String): UUID = UUID.fromString(validateAndExtract(token)["orgId"] as String)
    fun getRole(token: String): String = validateAndExtract(token)["role"] as String
}
```

```kotlin
// auth/JwtAuthFilter.kt
package com.gymsynk.auth

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthFilter(private val jwtService: JwtService) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        chain: FilterChain,
    ) {
        val header = request.getHeader("Authorization")
        if (header != null && header.startsWith("Bearer ")) {
            runCatching {
                val claims = jwtService.validateAndExtract(header.removePrefix("Bearer "))
                val role   = claims["role"] as String
                val auth   = UsernamePasswordAuthenticationToken(
                    claims.subject, null,
                    listOf(SimpleGrantedAuthority("ROLE_$role")),
                )
                auth.details = mapOf("userId" to claims.subject, "orgId" to claims["orgId"], "role" to role)
                SecurityContextHolder.getContext().authentication = auth
            }
        }
        chain.doFilter(request, response)
    }
}
```

### 1.5 Auth DTOs and controller

```kotlin
// auth/dto/AuthDtos.kt
package com.gymsynk.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank

data class LoginRequest(@field:Email val email: String, @field:NotBlank val password: String)
data class TokenResponse(val accessToken: String)
data class OtpRequest(@field:NotBlank val identifier: String)
data class OtpVerifyRequest(@field:NotBlank val identifier: String, @field:NotBlank val code: String)
```

```kotlin
// auth/AuthController.kt
package com.gymsynk.auth

import com.gymsynk.auth.dto.*
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/login")
    fun login(@RequestBody @Valid req: LoginRequest) =
        ResponseEntity.ok(authService.staffLogin(req))

    @PostMapping("/refresh")
    fun refresh(request: HttpServletRequest) =
        ResponseEntity.ok(authService.refresh(request))

    @PostMapping("/logout")
    fun logout(request: HttpServletRequest): ResponseEntity<Void> {
        authService.logout(request)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/otp/request")
    fun requestOtp(@RequestBody @Valid req: OtpRequest): ResponseEntity<Void> {
        authService.requestOtp(req.identifier)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/otp/verify")
    fun verifyOtp(@RequestBody @Valid req: OtpVerifyRequest) =
        ResponseEntity.ok(authService.verifyOtp(req))
}
```

**AuthService responsibilities** (implement the body yourself — the contract is fixed):
- `staffLogin`: BCrypt verify password → `generateAccessToken` + `generateRefreshToken` → `SET refresh:{uuid} userId:role EX 604800` in Redis → return `TokenResponse`, set refresh token in httpOnly cookie
- `refresh`: read refresh cookie → `GETDEL refresh:{token}` from Redis → issue new access token
- `logout`: `DEL refresh:{token}` from Redis
- `requestOtp`: generate 6-digit code → `SET otp:{identifier} code EX 300` → rate-limit check via `INCR otp_rate:{identifier}` with 10-min TTL → send email via `JavaMailSender`
- `verifyOtp`: `GETDEL otp:{identifier}` → compare → issue JWT pair

### 1.6 Organization entity + Setup guard

```kotlin
// organization/entity/Organization.kt
package com.gymsynk.organization.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "organizations")
class Organization(
    @Id val id: UUID = UUID.randomUUID(),

    @Column(nullable = false) var name: String,
    @Column(nullable = false, unique = true) var slug: String,
    @Column(name = "default_currency", length = 3) var defaultCurrency: String = "NGN",
    @Column(length = 50) var timezone: String = "Africa/Lagos",
    @Column(name = "payment_mode", length = 20) var paymentMode: String = "CASH_ONLY",
    @Column(name = "setup_complete") var setupComplete: Boolean = false,

    @Column(name = "created_at", updatable = false) val createdAt: Instant = Instant.now(),
)
```

`SetupGuardFilter` — implement as `OncePerRequestFilter`. On every request except `/auth/**` and `/setup`: query `organizationRepository.count()`. If 0 → respond `503` with body `{"redirect":"/setup"}`. Once setup is complete this filter is a no-op (count > 0 on every request).

### 1.7 User entity and member CRUD

```kotlin
// member/entity/User.kt
package com.gymsynk.member.entity

import com.gymsynk.organization.entity.Organization
import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

enum class UserRole { ADMIN, CASHIER, MEMBER, FLOOR_STAFF }

@Entity
@Table(name = "users")
class User(
    @Id val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    val org: Organization,

    @Column(unique = true) var email: String? = null,
    var phone: String? = null,
    @Column(name = "password_hash") var passwordHash: String? = null,
    @Column(name = "first_name", nullable = false) var firstName: String,
    @Column(name = "last_name", nullable = false) var lastName: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false) var role: UserRole = UserRole.MEMBER,

    @Column(name = "member_number", unique = true) var memberNumber: String? = null,
    @Column(name = "is_active") var isActive: Boolean = true,

    @Column(name = "created_at", updatable = false) val createdAt: Instant = Instant.now(),
)
```

Member number generation — inject `JdbcTemplate` and call:
```kotlin
fun nextMemberNumber(): String {
    val n = jdbcTemplate.queryForObject("SELECT nextval('member_number_seq')", Long::class.java)!!
    return "GS-%05d".format(n)
}
```

Now fill in the stubbed `DataSeeder.kt` — the `Organization` and `User` entities above match exactly what it expects.

### 1.8 Membership entities and expiry scheduler

```kotlin
// membership/MembershipExpiryScheduler.kt
package com.gymsynk.membership

import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.ZoneOffset

@Component
class MembershipExpiryScheduler(
    private val membershipRepository: MembershipRepository,
) {
    @Scheduled(cron = "0 0 * * * *")   // top of every hour
    @Transactional
    fun expireOverdue() {
        val today = LocalDate.now(ZoneOffset.UTC)
        val expiring = membershipRepository.findAllByStatusAndEndDateBefore("ACTIVE", today)
        expiring.forEach { it.status = "EXPIRED" }
        membershipRepository.saveAll(expiring)
    }
}
```

`MembershipRepository` needs this query:
```kotlin
@Query("SELECT m FROM Membership m WHERE m.status = :status AND m.endDate < :date")
fun findAllByStatusAndEndDateBefore(status: String, date: LocalDate): List<Membership>
```

### 1.9 QR token service

```kotlin
// checkin/QrTokenService.kt
package com.gymsynk.checkin

import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.time.Duration
import java.util.UUID

@Service
class QrTokenService(
    private val redis: StringRedisTemplate,
    @Value("\${app.qr.token-ttl-seconds}") private val ttlSeconds: Long,
) {
    private val rng = SecureRandom()

    fun generateToken(userId: UUID): String {
        val bytes = ByteArray(32).also { rng.nextBytes(it) }
        val token = bytes.joinToString("") { "%02x".format(it) }   // 64-char hex, no PII
        redis.opsForValue().set("qr:$token", userId.toString(), Duration.ofSeconds(ttlSeconds))
        return token
    }

    /**
     * Atomically gets and deletes the token in one Redis command.
     * If two cashiers scan simultaneously, only one gets the userId — the other gets null.
     */
    fun validateAndConsume(token: String): UUID? =
        redis.opsForValue().getAndDelete("qr:$token")
            ?.let { runCatching { UUID.fromString(it) }.getOrNull() }
}
```

### 1.10 Check-in engine (10-step pipeline)

```kotlin
// checkin/CheckInService.kt
package com.gymsynk.checkin

import com.gymsynk.common.exception.BusinessException
import com.gymsynk.common.exception.ErrorCodes
import com.gymsynk.member.repository.UserRepository
import com.gymsynk.membership.repository.MembershipRepository
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.util.UUID

@Service
class CheckInService(
    private val qrTokenService: QrTokenService,
    private val userRepository: UserRepository,
    private val membershipRepository: MembershipRepository,
    private val checkInRepository: CheckInRepository,
    private val operatingHoursRepository: OperatingHoursRepository,
    private val redis: StringRedisTemplate,
) {
    @Transactional
    fun validateQrAndRecord(token: String, cashierOrgId: UUID, locationId: UUID): CheckInResponse {

        // 1. Consume token — atomic GETDEL, single-use guaranteed
        val userId = qrTokenService.validateAndConsume(token)
            ?: throw BusinessException(ErrorCodes.TOKEN_INVALID, "QR token is invalid or expired", 422)

        // 2. Load member
        val member = userRepository.findById(userId).orElseThrow {
            BusinessException(ErrorCodes.MEMBER_NOT_FOUND, "Member not found", 404)
        }

        // 3. Verify org — prevents cross-gym QR misuse
        if (member.org.id != cashierOrgId)
            throw BusinessException(ErrorCodes.UNAUTHORIZED, "Cross-gym QR not allowed", 403)

        // 4. Load active membership
        val membership = membershipRepository.findActiveByUserAndLocation(userId, locationId)
            ?: return writeAndBroadcast(member, null, locationId, "EXPIRED_PLAN", "QR_SCAN", null, null)

        // 5. Check expiry
        val orgTz = ZoneId.of(member.org.timezone)
        val today = LocalDate.now(orgTz)
        if (membership.endDate.isBefore(today))
            return writeAndBroadcast(member, membership, locationId, "EXPIRED_PLAN", "QR_SCAN", null, null)

        // 6. Compute current session from operating hours
        val session = computeSession(locationId, LocalTime.now(orgTz))
            ?: throw BusinessException(ErrorCodes.WRONG_SESSION, "Outside operating hours", 422)

        // 7. Validate plan allows this session and day
        if (!membership.plan.allowedSessions.contains(session))
            throw BusinessException(ErrorCodes.WRONG_SESSION, "Plan not valid for $session", 422)
        if (!membership.plan.allowedDays.contains(today.dayOfWeek.value % 7))
            throw BusinessException(ErrorCodes.WRONG_DAY, "Plan not valid today", 422)

        // 8. Duplicate check — same user, location, session, day
        if (checkInRepository.existsByUserIdAndLocationIdAndSessionTypeAndDate(userId, locationId, session, today))
            throw BusinessException(ErrorCodes.ALREADY_CHECKED_IN, "Already checked in for $session", 422)

        // 9 + 10. Write record and broadcast to cashier dashboard
        return writeAndBroadcast(member, membership, locationId, "VALID", "QR_SCAN", session, null)
    }

    @Transactional
    fun manualCheckIn(memberId: UUID, locationId: UUID, cashierOrgId: UUID, overrideReason: String? = null): CheckInResponse {
        val member = userRepository.findById(memberId).orElseThrow {
            BusinessException(ErrorCodes.MEMBER_NOT_FOUND, "Member not found", 404)
        }
        val membership = membershipRepository.findActiveByUserAndLocation(memberId, locationId)
        val status = when {
            overrideReason != null -> "OVERRIDE"
            membership == null     -> "EXPIRED_PLAN"
            else                   -> "VALID"
        }
        return writeAndBroadcast(member, membership, locationId, status, "MANUAL", null, overrideReason)
    }

    private fun writeAndBroadcast(
        member: com.gymsynk.member.entity.User,
        membership: com.gymsynk.membership.entity.Membership?,
        locationId: UUID,
        status: String,
        method: String,
        session: String?,
        overrideReason: String?,
    ): CheckInResponse {
        val checkIn = checkInRepository.save(CheckIn(
            userId = member.id,
            membershipId = membership?.id,
            locationId = locationId,
            orgId = member.org.id,
            sessionType = session ?: "MORNING",
            checkInMethod = method,
            status = status,
            overrideReason = overrideReason,
            checkInTime = Instant.now(),
        ))
        val event = """{"checkInId":"${checkIn.id}","memberId":"${member.id}","name":"${member.firstName} ${member.lastName}","memberNumber":"${member.memberNumber}","status":"$status","session":"${session ?: ""}","method":"$method"}"""
        redis.convertAndSend("checkin:${member.org.id}", event)
        return CheckInResponse(
            checkInId = checkIn.id,
            memberName = "${member.firstName} ${member.lastName}",
            memberNumber = member.memberNumber ?: "",
            planName = membership?.plan?.name ?: "Unknown",
            session = session ?: "",
            status = status,
        )
    }

    private fun computeSession(locationId: UUID, time: LocalTime): String? {
        val hours = operatingHoursRepository.findByLocationId(locationId)
        return when {
            hours.any { it.sessionType == "MORNING" && time >= it.openTime && time < it.closeTime } -> "MORNING"
            hours.any { it.sessionType == "EVENING" && time >= it.openTime && time < it.closeTime } -> "EVENING"
            else -> null
        }
    }
}
```

### 1.11 Check-in DTOs and controller

```kotlin
// checkin/dto/CheckInDtos.kt
package com.gymsynk.checkin.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.util.UUID

data class CheckInResponse(
    val checkInId: UUID,
    val memberName: String,
    val memberNumber: String,
    val planName: String,
    val session: String,
    val status: String,
)

data class QrValidateRequest(@field:NotBlank val token: String, @field:NotNull val locationId: UUID)
data class ManualCheckInRequest(@field:NotNull val memberId: UUID, @field:NotNull val locationId: UUID, val overrideReason: String? = null)
data class QrTokenResponse(val token: String, val qrBase64: String, val ttlSeconds: Int)
```

```kotlin
// checkin/CheckInController.kt
package com.gymsynk.checkin

import com.gymsynk.checkin.dto.*
import com.gymsynk.common.util.QrCodeGenerator
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/checkin")
class CheckInController(
    private val checkInService: CheckInService,
    private val qrTokenService: QrTokenService,
    private val qrCodeGenerator: QrCodeGenerator,
) {
    @PostMapping("/qr-token")
    @PreAuthorize("hasRole('MEMBER')")
    fun generateQrToken(auth: Authentication): ResponseEntity<QrTokenResponse> {
        val userId  = UUID.fromString(auth.name)
        val token   = qrTokenService.generateToken(userId)
        val qrBytes = qrCodeGenerator.generate(token)
        val base64  = "data:image/png;base64,${java.util.Base64.getEncoder().encodeToString(qrBytes)}"
        return ResponseEntity.ok(QrTokenResponse(token, base64, 120))
    }

    @PostMapping("/validate")
    @PreAuthorize("hasAnyRole('CASHIER', 'ADMIN')")
    fun validateQr(@RequestBody @Valid req: QrValidateRequest, auth: Authentication): ResponseEntity<CheckInResponse> {
        val orgId = UUID.fromString((auth.details as Map<*, *>)["orgId"] as String)
        return ResponseEntity.ok(checkInService.validateQrAndRecord(req.token, orgId, req.locationId))
    }

    @PostMapping("/manual")
    @PreAuthorize("hasAnyRole('CASHIER', 'ADMIN')")
    fun manualCheckIn(
        @RequestBody @Valid req: ManualCheckInRequest,
        @RequestHeader(value = "X-Override", required = false) override: Boolean?,
        auth: Authentication,
    ): ResponseEntity<CheckInResponse> {
        val orgId = UUID.fromString((auth.details as Map<*, *>)["orgId"] as String)
        val reason = if (override == true) req.overrideReason else null
        return ResponseEntity.ok(checkInService.manualCheckIn(req.memberId, req.locationId, orgId, reason))
    }
}
```

### 1.12 QrCodeGenerator utility

```kotlin
// common/util/QrCodeGenerator.kt
package com.gymsynk.common.util

import com.google.zxing.BarcodeFormat
import com.google.zxing.client.j2se.MatrixToImageWriter
import com.google.zxing.qrcode.QRCodeWriter
import org.springframework.stereotype.Component
import java.io.ByteArrayOutputStream

@Component
class QrCodeGenerator {
    private val writer = QRCodeWriter()

    fun generate(content: String, size: Int = 280): ByteArray {
        val matrix = writer.encode(content, BarcodeFormat.QR_CODE, size, size)
        val out = ByteArrayOutputStream()
        MatrixToImageWriter.writeToStream(matrix, "PNG", out)
        return out.toByteArray()
    }
}
```

### 1.13 WebSocket + Redis pub/sub bridge

```kotlin
// config/WebSocketConfig.kt
package com.gymsynk.config

import org.springframework.context.annotation.Configuration
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.web.socket.config.annotation.*

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig : WebSocketMessageBrokerConfigurer {

    override fun configureMessageBroker(registry: MessageBrokerRegistry) {
        registry.enableSimpleBroker("/topic")
        registry.setApplicationDestinationPrefixes("/app")
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS()
    }
}
```

```kotlin
// checkin/websocket/CheckInWebSocketHandler.kt
package com.gymsynk.checkin.websocket

import org.springframework.data.redis.connection.Message
import org.springframework.data.redis.connection.MessageListener
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class CheckInWebSocketHandler(
    private val messagingTemplate: SimpMessagingTemplate,
) : MessageListener {

    // Called by RedisMessageListenerContainer whenever a check-in is published
    override fun onMessage(message: Message, pattern: ByteArray?) {
        val orgId   = String(message.channel).removePrefix("checkin:")
        val payload = String(message.body)
        // Pushes to all connected cashier dashboards subscribed to this org
        messagingTemplate.convertAndSend("/topic/checkins/$orgId", payload)
    }
}
```

```kotlin
// config/RedisConfig.kt
package com.gymsynk.config

import com.gymsynk.checkin.websocket.CheckInWebSocketHandler
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.listener.PatternTopic
import org.springframework.data.redis.listener.RedisMessageListenerContainer

@Configuration
class RedisConfig {

    @Bean
    fun redisListenerContainer(
        factory: RedisConnectionFactory,
        handler: CheckInWebSocketHandler,
    ): RedisMessageListenerContainer = RedisMessageListenerContainer().apply {
        setConnectionFactory(factory)
        addMessageListener(handler, PatternTopic("checkin:*"))
    }
}
```

### 1.14 CASH_ONLY payment strategy

```kotlin
// payment/strategy/PaymentStrategy.kt
package com.gymsynk.payment.strategy

import com.gymsynk.payment.entity.Payment
import java.util.UUID

data class PaymentRequest(
    val membershipId: UUID,
    val userId: UUID,
    val orgId: UUID,
    val amount: java.math.BigDecimal,
    val currency: String,
    val cashierId: UUID,
)
data class PaymentResult(val paymentId: UUID, val status: String)

sealed interface PaymentStrategy {
    fun processPayment(request: PaymentRequest): PaymentResult
    fun generateReceipt(payment: Payment): ByteArray?
    fun requiresExternalConfirmation(): Boolean
}
```

```kotlin
// payment/strategy/CashOnlyStrategy.kt
package com.gymsynk.payment.strategy

import com.gymsynk.payment.entity.Payment
import com.gymsynk.payment.repository.PaymentRepository
import org.springframework.stereotype.Component

@Component
class CashOnlyStrategy(private val paymentRepository: PaymentRepository) : PaymentStrategy {

    override fun processPayment(request: PaymentRequest): PaymentResult {
        val payment = paymentRepository.save(
            Payment(
                membershipId  = request.membershipId,
                userId        = request.userId,
                orgId         = request.orgId,
                amount        = request.amount,
                currency      = request.currency,
                paymentMethod = "CASH",
                paymentStatus = "COMPLETED",
                receivedBy    = request.cashierId,
            )
        )
        return PaymentResult(payment.id, "COMPLETED")
    }

    override fun generateReceipt(payment: Payment): ByteArray? = null
    override fun requiresExternalConfirmation() = false
}
```

`PaymentService.processPayment()` reads `org.paymentMode` and delegates to the matching strategy.
In v1.0 only `CashOnlyStrategy` is active. `TrackAndReceiptStrategy` and `FullProcessingStrategy`
are v1.1 — stub them as `TODO("v1.1")` for now so the sealed interface is complete.

---

## Phase 1 exit check

Work through this sequence with Postman or Thunder Client. Every step must succeed.

```
1. POST http://localhost:8080/api/v1/auth/login
   Body: { "email": "cashier@gymsynk.com", "password": "password" }
   Expect: 200  { "accessToken": "eyJ..." }
   → Save as CASHIER_TOKEN

2. POST http://localhost:8080/api/v1/auth/otp/request
   Body: { "identifier": "member1@gymsynk.com" }
   Expect: 204
   → Check email or Spring logs for the 6-digit code

3. POST http://localhost:8080/api/v1/auth/otp/verify
   Body: { "identifier": "member1@gymsynk.com", "code": "123456" }
   Expect: 200  { "accessToken": "eyJ..." }
   → Save as MEMBER_TOKEN

4. POST http://localhost:8080/api/v1/checkin/qr-token
   Authorization: Bearer MEMBER_TOKEN
   Expect: 200  { "token": "abc123...", "qrBase64": "data:image/png;base64,...", "ttlSeconds": 120 }
   → Save the token string

5. POST http://localhost:8080/api/v1/checkin/validate
   Authorization: Bearer CASHIER_TOKEN
   Body: { "token": "abc123...", "locationId": "<location-uuid-from-seed>" }
   Expect: 200  { "status": "VALID", "memberName": "...", "planName": "..." }

6. Verify the DB write:
   docker exec -it $(docker ps -qf name=db) psql -U gymsynk \
     -c "SELECT user_id, status, check_in_method FROM check_ins ORDER BY created_at DESC LIMIT 1;"
   Expect: status = VALID, check_in_method = QR_SCAN

7. WebSocket test:
   Open a WebSocket client (Postman → New → WebSocket).
   Connect to: ws://localhost:8080/api/v1/ws/websocket
   Send STOMP CONNECT frame, then SUBSCRIBE to /topic/checkins/<orgId>
   Repeat steps 4 + 5 with a fresh token.
   Expect: JSON event appears on the subscription within 1 second.
```

All 7 pass → Phase 1 is done. Move to Phase 2 (Cashier Portal).

---

## What's next after Phase 1

| Phase | What you're building | Guide |
|:------|:---------------------|:------|
| Phase 2 | Cashier portal — live WebSocket feed, member registration, QR scanner station | `GymSynk_Implementation_Guide.md` §4 |
| Phase 3 | Member PWA — OTP login, QR display, offline fallback | `GymSynk_Implementation_Guide.md` §5 |
| Phase 4 | First-run setup wizard + `setup-cli.sh` | `GymSynk_Implementation_Guide.md` §6 |
| Phase 5 | Hardening — Testcontainers, Playwright E2E, rate limiting, production Dockerfiles | `GymSynk_Implementation_Guide.md` §7 |

Build Phase 3 only after Phase 2 has a working login — the member PWA depends on the auth flow being stable.
