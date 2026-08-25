package com.gymsynk.member.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import java.time.Instant
import java.util.UUID

data class StaffMemberResponse(
    val id: UUID,
    val firstName: String,
    val lastName: String,
    val email: String?,
    val phone: String?,
    val role: String,
    val isActive: Boolean,
    val createdAt: Instant,
)

data class CreateStaffRequest(
    @field:NotBlank val firstName: String,
    @field:NotBlank val lastName: String,
    @field:Email @field:NotBlank val email: String,
    val phone: String? = null,
    val role: String = "CASHIER", // ADMIN | CASHIER | FLOOR_STAFF
    @field:NotBlank val password: String,
)
