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

data class CheckInHistoryItem(
    val checkInId: UUID,
    val checkInTime: Instant,
    val locationName: String,
    val planName: String,
    val session: String,
    val status: String,
    val method: String,
)

data class CheckInHistoryResponse(
    val items: List<CheckInHistoryItem>,
    val totalPages: Int,
    val totalElements: Long,
)
