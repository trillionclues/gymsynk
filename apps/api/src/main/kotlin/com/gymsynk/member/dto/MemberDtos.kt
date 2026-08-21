package com.gymsynk.member.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

data class MemberListItem(
    val id: UUID,
    val firstName: String,
    val lastName: String,
    val email: String?,
    val phone: String?,
    val memberNumber: String?,
    val isActive: Boolean,
    val activePlanName: String?,
    val activeMembershipEndsOn: LocalDate?,
)

data class ActiveMembershipView(
    val membershipId: UUID,
    val planName: String,
    val locationId: UUID,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val status: String,
    val price: BigDecimal,
    val currency: String,
)

data class MemberProfileResponse(
    val member: MemberListItem,
    val activeMembership: ActiveMembershipView?,
)

data class CreateMemberRequest(
    @field:NotBlank val firstName: String,
    @field:NotBlank val lastName: String,
    val email: String? = null,
    val phone: String? = null,
    @field:NotNull val planId: UUID,
    @field:NotNull val locationId: UUID,
    val startDate: LocalDate? = null,
    val paymentAmount: BigDecimal? = null,
)

data class MemberRegistrationResponse(
    val member: MemberProfileResponse,
    val paymentId: UUID,
    val paymentStatus: String,
)
