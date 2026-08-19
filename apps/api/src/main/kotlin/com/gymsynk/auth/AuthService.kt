package com.gymsynk.auth

import com.gymsynk.auth.dto.*
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Service

/**
 * Auth service — staff login, token refresh, logout, and member OTP flows.
 *
 * Implementation checklist (Phase 1 §1.5):
 *  - staffLogin:   BCrypt verify → generateAccessToken + generateRefreshToken
 *                  → SET refresh:{uuid} in Redis EX 604800
 *                  → return TokenResponse, set httpOnly refresh cookie
 *  - refresh:      read httpOnly cookie → GETDEL refresh:{token} from Redis
 *                  → issue new access token
 *  - logout:       DEL refresh:{token} from Redis
 *  - requestOtp:   generate 6-digit code → SET otp:{identifier} EX 300
 *                  → rate-limit via INCR otp_rate:{identifier} with 10-min TTL
 *                  → send email via JavaMailSender
 *  - verifyOtp:    GETDEL otp:{identifier} → compare → issue JWT pair
 */
@Service
class AuthService(
    private val jwtService: JwtService,
    private val userRepository: com.gymsynk.member.repository.UserRepository,
    private val passwordEncoder: org.springframework.security.crypto.password.PasswordEncoder,
    private val redis: org.springframework.data.redis.core.StringRedisTemplate,
) {
    fun staffLogin(req: LoginRequest): TokenResponse {
        TODO("Implement: find user by email, verify BCrypt password, generate tokens, set refresh cookie")
    }

    fun refresh(request: HttpServletRequest): TokenResponse {
        TODO("Implement: read refresh cookie, GETDEL from Redis, issue new access token")
    }

    fun logout(request: HttpServletRequest) {
        TODO("Implement: read refresh cookie, DEL from Redis")
    }

    fun requestOtp(identifier: String) {
        TODO("Implement: generate 6-digit code, SET in Redis with TTL, send email")
    }

    fun verifyOtp(req: OtpVerifyRequest): TokenResponse {
        TODO("Implement: GETDEL otp:{identifier}, compare code, issue JWT pair")
    }
}
