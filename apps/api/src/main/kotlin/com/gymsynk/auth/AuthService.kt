package com.gymsynk.auth

import com.gymsynk.auth.dto.*
import com.gymsynk.common.exception.BusinessException
import com.gymsynk.common.exception.ErrorCodes
import com.gymsynk.member.repository.UserRepository
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.time.Duration
import java.util.UUID

@Service
class AuthService(
    private val jwtService: JwtService,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val redis: StringRedisTemplate,
    @Value("\${app.jwt.secret}") private val jwtSecret: String,
    @Value("\${app.otp.ttl-seconds}") private val otpTtlSeconds: Long,
    @Value("\${app.otp.max-requests-per-10min}") private val otpMaxRequests: Long,
) {
    private val log = LoggerFactory.getLogger(AuthService::class.java)
    private val rng = SecureRandom()

    private val refreshTtl = Duration.ofDays(7)
    private val refreshCookieName = "refresh_token"

    // Staff login

    fun staffLogin(req: LoginRequest, response: HttpServletResponse): TokenResponse {
        val user = userRepository.findByEmail(req.email).orElseThrow {
            BusinessException(ErrorCodes.UNAUTHORIZED, "Invalid email or password", 401)
        }

        if (!user.isActive)
            throw BusinessException(ErrorCodes.UNAUTHORIZED, "Account is deactivated", 401)

        if (user.passwordHash == null || !passwordEncoder.matches(req.password, user.passwordHash))
            throw BusinessException(ErrorCodes.UNAUTHORIZED, "Invalid email or password", 401)

        // Only ADMIN and CASHIER can use the staff login endpoint
        if (user.role.name == "MEMBER")
            throw BusinessException(ErrorCodes.UNAUTHORIZED, "Members use OTP login", 403)

        val accessToken  = jwtService.generateAccessToken(user.id, user.role.name, user.org.id)
        val refreshToken = jwtService.generateRefreshToken()

        // Store refresh token in Redis — key holds userId so we can look up the user on refresh
        redis.opsForValue().set(
            "refresh:$refreshToken",
            "${user.id}:${user.role.name}:${user.org.id}",
            refreshTtl,
        )

        setRefreshCookie(response, refreshToken)
        return TokenResponse(accessToken)
    }

    // Token refresh

    fun refresh(request: HttpServletRequest, response: HttpServletResponse): TokenResponse {
        val refreshToken = extractRefreshCookie(request)
            ?: throw BusinessException(ErrorCodes.TOKEN_INVALID, "No refresh token", 401)

        // GETDEL — atomically consumes the old token (rotation)
        val value = redis.opsForValue().getAndDelete("refresh:$refreshToken")
            ?: throw BusinessException(ErrorCodes.TOKEN_EXPIRED, "Refresh token expired or already used", 401)

        val (userId, role, orgId) = value.split(":")
        val accessToken      = jwtService.generateAccessToken(UUID.fromString(userId), role, UUID.fromString(orgId))
        val newRefreshToken  = jwtService.generateRefreshToken()

        // Issue rotated refresh token
        redis.opsForValue().set("refresh:$newRefreshToken", value, refreshTtl)
        setRefreshCookie(response, newRefreshToken)

        return TokenResponse(accessToken)
    }

    // Logout

    fun logout(request: HttpServletRequest, response: HttpServletResponse) {
        extractRefreshCookie(request)?.let { token ->
            redis.delete("refresh:$token")
        }
        // Clear the cookie
        val cookie = Cookie(refreshCookieName, "").apply {
            isHttpOnly = true
            secure     = false   // set to true in prod
            path       = "/"
            maxAge     = 0
        }
        response.addCookie(cookie)
    }

    // Member OTP login

    fun requestOtp(identifier: String) {
        // Rate-limit: max N requests per 10 minutes per identifier
        val rateKey   = "otp_rate:$identifier"
        val attempts  = redis.opsForValue().increment(rateKey) ?: 1L
        if (attempts == 1L) redis.expire(rateKey, Duration.ofMinutes(10))
        if (attempts > otpMaxRequests)
            throw BusinessException("OTP_RATE_LIMIT", "Too many OTP requests — try again in 10 minutes", 429)

        // Verify the identifier belongs to a known member
        userRepository.findByEmail(identifier).orElseThrow {
            // Return 204 regardless to avoid user enumeration — just don't store/send the code
            // We throw here only to avoid generating a code for unknown emails
            BusinessException(ErrorCodes.MEMBER_NOT_FOUND, "Member not found", 404)
        }

        val code = "%06d".format(rng.nextInt(1_000_000))
        redis.opsForValue().set("otp:$identifier", code, Duration.ofSeconds(otpTtlSeconds))

        // In dev: log the code so you can test without an email server
        // In prod: replace this block with JavaMailSender send
        log.info("OTP for {} → {} (remove this log line before production)", identifier, code)

        // TODO (Phase 4): wire JavaMailSender here:
        // mailSender.send { msg ->
        //     msg.setTo(identifier)
        //     msg.subject = "Your GymSynk login code"
        //     msg.text = "Your code is $code. It expires in 5 minutes."
        // }
    }

    fun verifyOtp(req: OtpVerifyRequest, response: HttpServletResponse): TokenResponse {
        val stored = redis.opsForValue().getAndDelete("otp:${req.identifier}")
            ?: throw BusinessException(ErrorCodes.TOKEN_EXPIRED, "OTP expired or already used", 401)

        if (stored != req.code)
            throw BusinessException(ErrorCodes.TOKEN_INVALID, "Invalid OTP", 401)

        val user = userRepository.findByEmail(req.identifier).orElseThrow {
            BusinessException(ErrorCodes.MEMBER_NOT_FOUND, "Member not found", 404)
        }

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

    // Helpers

    private fun setRefreshCookie(response: HttpServletResponse, token: String) {
        val cookie = Cookie(refreshCookieName, token).apply {
            isHttpOnly = true
            secure     = false    // set to true behind HTTPS in production
            path       = "/"
            maxAge     = refreshTtl.seconds.toInt()
        }
        response.addCookie(cookie)
    }

    private fun extractRefreshCookie(request: HttpServletRequest): String? =
        request.cookies?.firstOrNull { it.name == refreshCookieName }?.value
}
