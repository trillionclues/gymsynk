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
class JwtService(
    @Value("\${app.jwt.secret}") secret: String,
    @Value("\${app.jwt.access-ttl-minutes:15}") private val accessTtlMinutes: Long,
) {
    private val key: SecretKey = Keys.hmacShaKeyFor(secret.toByteArray())
    private val accessTtlMs = accessTtlMinutes * 60 * 1000L

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