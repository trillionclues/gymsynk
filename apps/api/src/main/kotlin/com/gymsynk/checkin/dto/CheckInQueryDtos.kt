package com.gymsynk.checkin.dto

import java.time.Instant
import java.util.UUID

data class TodayCheckInResponse(
    val checkInId: UUID,
    val checkInTime: Instant,
    val memberName: String,
    val memberNumber: String,
    val planName: String,
    val session: String,
    val status: String,
    val method: String,
    val locationId: UUID,
    val overrideReason: String?,
)
