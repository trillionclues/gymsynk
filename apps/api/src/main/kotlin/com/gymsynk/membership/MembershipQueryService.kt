package com.gymsynk.membership

import com.gymsynk.common.exception.BusinessException
import com.gymsynk.common.exception.ErrorCodes
import com.gymsynk.member.repository.UserRepository
import com.gymsynk.membership.dto.ExpiringMembershipResponse
import com.gymsynk.membership.repository.MembershipRepository
import com.gymsynk.organization.repository.OrganizationRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
class MembershipQueryService(
    private val organizationRepository: OrganizationRepository,
    private val membershipRepository: MembershipRepository,
    private val userRepository: UserRepository,
) {
    @Transactional(readOnly = true)
    fun expiring(orgId: UUID, days: Long): List<ExpiringMembershipResponse> {
        val organization = organizationRepository.findById(orgId).orElseThrow {
            BusinessException(ErrorCodes.UNAUTHORIZED, "Organization not found", 404)
        }
        val zone = ZoneId.of(organization.timezone)
        val today = LocalDate.now(zone)
        val end = today.plusDays(days)

        val memberships = membershipRepository.findExpiringBetween(orgId, today, end)
        val usersById = userRepository.findAllById(memberships.map { it.userId }.distinct()).associateBy { it.id }

        return memberships.map { membership ->
            val user = usersById[membership.userId]
            ExpiringMembershipResponse(
                membershipId = membership.id,
                memberId = membership.userId,
                memberName = user?.let { "${it.firstName} ${it.lastName}" } ?: "Unknown member",
                memberNumber = user?.memberNumber ?: "",
                planName = membership.plan.name,
                endDate = membership.endDate,
                daysRemaining = ChronoUnit.DAYS.between(today, membership.endDate),
                locationId = membership.locationId,
            )
        }
    }
}
