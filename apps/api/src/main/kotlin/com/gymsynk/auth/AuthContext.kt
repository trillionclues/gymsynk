package com.gymsynk.auth

import org.springframework.security.core.Authentication
import java.util.UUID

data class AuthContext(
    val userId: UUID,
    val orgId: UUID,
    val role: String,
)

fun Authentication.requireAuthContext(): AuthContext =
    details as? AuthContext
        ?: error("Authentication details do not contain an AuthContext")
