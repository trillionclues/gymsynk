package com.gymsynk.auth

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

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
                val userId = UUID.fromString(claims.subject)
                val orgId  = UUID.fromString(claims["orgId"] as String)
                val auth   = UsernamePasswordAuthenticationToken(
                    claims.subject, null,
                    listOf(SimpleGrantedAuthority("ROLE_$role")),
                )
                auth.details = AuthContext(userId = userId, orgId = orgId, role = role)
                SecurityContextHolder.getContext().authentication = auth
            }
        }
        chain.doFilter(request, response)
    }
}
