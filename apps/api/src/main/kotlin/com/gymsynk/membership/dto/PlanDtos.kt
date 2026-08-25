package com.gymsynk.membership.dto

import jakarta.validation.constraints.NotBlank
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
    val isActive: Boolean,
)

data class CreatePlanRequest(
    @field:NotBlank val name: String,
    val durationType: String = "MONTHLY",
    val durationValue: Int = 1,
    val price: BigDecimal = BigDecimal.ZERO,
    val currency: String = "NGN",
    val allowedSessions: String = "MORNING,EVENING",
    val allowedDays: String = "0,1,2,3,4,5,6",
    val maxCheckinsPerDay: Int = 1,
)

data class UpdatePlanRequest(
    val name: String? = null,
    val durationType: String? = null,
    val durationValue: Int? = null,
    val price: BigDecimal? = null,
    val currency: String? = null,
    val allowedSessions: String? = null,
    val allowedDays: String? = null,
    val maxCheckinsPerDay: Int? = null,
)
