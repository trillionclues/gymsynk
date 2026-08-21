package com.gymsynk.checkin.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.util.UUID

data class CheckInResponse(
    val checkInId: UUID,
    val memberId: UUID,
    val memberName: String,
    val memberNumber: String,
    val planName: String,
    val session: String,
    val status: String,
)

data class QrValidateRequest(@field:NotBlank val token: String, @field:NotNull val locationId: UUID)
data class ManualCheckInRequest(@field:NotNull val memberId: UUID, @field:NotNull val locationId: UUID, val overrideReason: String? = null)
data class QrTokenResponse(val token: String, val qrBase64: String, val ttlSeconds: Int)
