package com.gymsynk.membership.dto

import java.time.LocalDate
import java.util.UUID

data class ExpiringMembershipResponse(
    val membershipId: UUID,
    val memberId: UUID,
    val memberName: String,
    val memberNumber: String,
    val planName: String,
    val endDate: LocalDate,
    val daysRemaining: Long,
    val locationId: UUID,
)
