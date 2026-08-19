
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