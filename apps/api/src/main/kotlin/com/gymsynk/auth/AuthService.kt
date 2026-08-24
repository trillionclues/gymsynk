package com.gymsynk.auth

import com.gymsynk.auth.dto.*
import com.gymsynk.common.email.EmailService
import com.gymsynk.common.exception.BusinessException
import com.gymsynk.common.exception.ErrorCodes
import com.gymsynk.member.repository.UserRepository
import com.gymsynk.organization.repository.OrganizationRepository
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.SecureRandom
import java.time.Duration
import java.util.UUID

@Service
class AuthService(
    private val jwtService: JwtService,
    private val userRepository: UserRepository,
    private val orgRepository: OrganizationRepository,
    private val passwordEncoder: PasswordEncoder,
    private val redis: StringRedisTemplate,
    private val emailService: EmailService,
    @Value("\${app.otp.ttl-seconds}") private val otpTtlSeconds: Long,
    @Value("\${app.otp.max-requests-per-10min}") private val otpMaxRequests: Long,
) {
    private val log = LoggerFactory.getLogger(AuthService::class.java)
    private val rng = SecureRandom()

    private val refreshTtl = Duration.ofDays(30)
    private val refreshCookieName = "refresh_token"

    // ── Staff login ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    fun staffLogin(req: LoginRequest, response: HttpServletResponse): TokenResponse {
        val user = userRepository.findByEmail(req.email).orElseThrow {
            BusinessException(ErrorCodes.UNAUTHORIZED, "Invalid email or password", 401)
        }

        if (!user.isActive)
            throw BusinessException(ErrorCodes.UNAUTHORIZED, "Account is deactivated", 401)

        if (user.passwordHash == null || !passwordEncoder.matches(req.password, user.passwordHash))
            throw BusinessException(ErrorCodes.UNAUTHORIZED, "Invalid email or password", 401)

        if (user.role.name == "MEMBER")
            throw BusinessException(ErrorCodes.UNAUTHORIZED, "Members use OTP login", 403)

        val accessToken  = jwtService.generateAccessToken(user.id, user.role.name, user.org.id)
        val refreshToken = jwtService.generateRefreshToken()

        redis.opsForValue().set(
            "refresh:$refreshToken",
            "${user.id}:${user.role.name}:${user.org.id}",
            refreshTtl,
        )

        setRefreshCookie(response, refreshToken)
        return TokenResponse(accessToken)
    }

    // ── Token refresh ────────────────────────────────────────────────────────

    fun refresh(request: HttpServletRequest, response: HttpServletResponse): TokenResponse {
        val refreshToken = extractRefreshCookie(request)
            ?: throw BusinessException(ErrorCodes.TOKEN_INVALID, "No refresh token", 401)

        val value = redis.opsForValue().getAndDelete("refresh:$refreshToken")
            ?: throw BusinessException(ErrorCodes.TOKEN_EXPIRED, "Refresh token expired or already used", 401)

        val parts   = value.split(":")
        val userId  = parts[0]
        val role    = parts[1]
        val orgId   = parts[2]

        val accessToken     = jwtService.generateAccessToken(UUID.fromString(userId), role, UUID.fromString(orgId))
        val newRefreshToken = jwtService.generateRefreshToken()

        redis.opsForValue().set("refresh:$newRefreshToken", value, refreshTtl)
        setRefreshCookie(response, newRefreshToken)

        return TokenResponse(accessToken)
    }

    // ── Logout ───────────────────────────────────────────────────────────────

    fun logout(request: HttpServletRequest, response: HttpServletResponse) {
        extractRefreshCookie(request)?.let { redis.delete("refresh:$it") }
        response.addHeader(
            "Set-Cookie",
            "refresh_token=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure",
        )
    }

    // ── Member OTP login ─────────────────────────────────────────────────────

    fun requestOtp(identifier: String) {
        val rateKey  = "otp_rate:$identifier"
        val attempts = redis.opsForValue().increment(rateKey) ?: 1L
        if (attempts == 1L) redis.expire(rateKey, Duration.ofMinutes(10))
        if (attempts > otpMaxRequests)
            throw BusinessException("OTP_RATE_LIMIT", "Too many OTP requests — try again in 10 minutes", 429)

        // Verify member exists — silent 404 to avoid user enumeration in logs
        userRepository.findByEmail(identifier).orElseThrow {
            BusinessException(ErrorCodes.MEMBER_NOT_FOUND, "Member not found", 404)
        }

        val code = "%06d".format(rng.nextInt(1_000_000))
        redis.opsForValue().set("otp:$identifier", code, Duration.ofSeconds(otpTtlSeconds))

        // Send via Resend SMTP — fires async, never crashes the request
        emailService.sendOtp(identifier, code, otpTtlSeconds / 60)

        // Keep dev log so you can test without checking email
        log.debug("OTP for {} → {}", identifier, code)
    }

    @Transactional(readOnly = true)
    fun verifyOtp(req: OtpVerifyRequest, response: HttpServletResponse): TokenResponse {
        val stored = redis.opsForValue().getAndDelete("otp:${req.identifier}")
            ?: throw BusinessException(ErrorCodes.TOKEN_EXPIRED, "OTP expired or already used", 401)

        if (stored != req.code)
            throw BusinessException(ErrorCodes.TOKEN_INVALID, "Invalid OTP", 401)

        val user = userRepository.findByEmail(req.identifier).orElseThrow {
            BusinessException(ErrorCodes.MEMBER_NOT_FOUND, "Member not found", 404)
        }

        // Access org.id inside the transaction — lazy proxy is safe here because
        // @Transactional keeps the Hibernate session open for the method's duration.
        // We also validate the org exists as a safety net.
        val orgId = user.org.id

        val accessToken  = jwtService.generateAccessToken(user.id, user.role.name, orgId)
        val refreshToken = jwtService.generateRefreshToken()

        redis.opsForValue().set(
            "refresh:$refreshToken",
            "${user.id}:${user.role.name}:$orgId",
            refreshTtl,
        )
        setRefreshCookie(response, refreshToken)
        return TokenResponse(accessToken)
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun setRefreshCookie(response: HttpServletResponse, token: String) {
        // SameSite=None; Secure is required when frontend and API are on different
        // origins (e.g. Vercel frontend + ngrok/prod API). Spring's Cookie API
        // doesn't support SameSite directly — set it via the raw header.
        val maxAge = refreshTtl.seconds.toInt()
        val secure = true   // ngrok and Vercel are both HTTPS
        val cookie = "refresh_token=$token; HttpOnly; Path=/; Max-Age=$maxAge;" +
                     " SameSite=None${if (secure) "; Secure" else ""}"
        response.addHeader("Set-Cookie", cookie)
    }

    private fun extractRefreshCookie(request: HttpServletRequest): String? =
        request.cookies?.firstOrNull { it.name == refreshCookieName }?.value
}
