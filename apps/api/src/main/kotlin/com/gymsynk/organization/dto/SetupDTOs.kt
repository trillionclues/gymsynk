package com.gymsynk.organization.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import java.math.BigDecimal

data class SetupStatusResponse(
    val setupComplete: Boolean,
)

data class OperatingHourRequest(
    val dayOfWeek: Int,
    val sessionType: String,
    val openTime: String,
    val closeTime: String,
    val isActive: Boolean = true,
)

data class MembershipPlanRequest(
    @field:NotBlank val name: String,
    val price: BigDecimal = BigDecimal.ZERO,
    val currency: String = "NGN",
    val durationType: String = "MONTHLY",
    val durationValue: Int = 1,
    val allowedSessions: String = "MORNING,EVENING",
    val allowedDays: String = "0,1,2,3,4,5,6",
    val maxCheckinsPerDay: Int = 1,
)

data class PaymentGatewayConfig(
    val provider: String = "PAYSTACK",
    val publicKey: String? = null,
    val secretKey: String? = null,
    val webhookSecret: String? = null,
)

data class SetupRequest(
    @field:NotBlank val orgName: String,
    val currency: String = "NGN",
    val timezone: String = "Africa/Lagos",
    val paymentMode: String = "CASH_ONLY",
    val gatewayConfig: PaymentGatewayConfig? = null,

    @field:NotBlank val locationName: String,
    val address: String? = null,
    val phone: String? = null,

    val operatingHours: List<OperatingHourRequest> = emptyList(),

    @field:NotEmpty val plans: List<MembershipPlanRequest> = emptyList(),

    @field:NotBlank val adminFirstName: String,
    @field:NotBlank val adminLastName: String,
    @field:Email @field:NotBlank val adminEmail: String,
    @field:NotBlank val adminPassword: String,
)
