package com.gymsynk.membership.dto

import java.math.BigDecimal
import java.util.UUID

data class PlanResponse(
    val id: UUID,
    val name: String,
    val durationType: String,
    val durationValue: Int,
    val price: BigDecimal,
    val currency: String,
    val allowedSessions: List<String>,
    val allowedDays: List<Int>,
    val maxCheckInsPerDay: Int,
)
