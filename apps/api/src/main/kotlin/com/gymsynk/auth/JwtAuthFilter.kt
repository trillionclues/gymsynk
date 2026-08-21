package com.gymsynk.auth

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

@Component
class JwtAuthFilter(private val jwtService: JwtService) : OncePerRequestFilter() {

    private val log = LoggerFactory.getLogger(JwtAuthFilter::class.java)

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        chain: FilterChain,
    ) {
        val header = request.getHeader("Authorization")
        if (header != null && header.startsWith("Bearer ", ignoreCase = true)) {
            runCatching {
                val token = header.substring(7).trim()
                val claims = jwtService.validateAndExtract(token)
                val role   = claims["role"] as String
                val userId = UUID.fromString(claims.subject)
                val orgId  = UUID.fromString(claims["orgId"] as String)

                val cleanRole = role.removePrefix("ROLE_")
                val authorities = listOf(
                    SimpleGrantedAuthority("ROLE_$cleanRole"),
                    SimpleGrantedAuthority(cleanRole),
                )
                val auth = UsernamePasswordAuthenticationToken(claims.subject, null, authorities)
                auth.details = AuthContext(userId = userId, orgId = orgId, role = cleanRole)
                SecurityContextHolder.getContext().authentication = auth
            }.onFailure { ex ->
                log.error("JWT authentication failed: ${ex.message}", ex)
            }
        }
        chain.doFilter(request, response)
    }
}
