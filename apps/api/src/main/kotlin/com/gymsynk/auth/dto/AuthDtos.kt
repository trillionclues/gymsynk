package com.gymsynk.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank

data class LoginRequest(@field:Email val email: String, @field:NotBlank val password: String)
data class TokenResponse(val accessToken: String)
data class OtpRequest(@field:NotBlank val identifier: String)
data class OtpVerifyRequest(@field:NotBlank val identifier: String, @field:NotBlank val code: String)