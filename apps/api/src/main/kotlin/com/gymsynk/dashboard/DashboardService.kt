package com.gymsynk.dashboard

import com.gymsynk.checkin.repository.CheckInRepository
import com.gymsynk.common.exception.BusinessException
import com.gymsynk.common.exception.ErrorCodes
import com.gymsynk.dashboard.dto.DashboardStatsResponse
import com.gymsynk.membership.repository.MembershipRepository
import com.gymsynk.organization.repository.OrganizationRepository
import com.gymsynk.payment.repository.PaymentRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.ZoneId
import java.util.UUID

@Service
class DashboardService(
    private val organizationRepository: OrganizationRepository,
    private val checkInRepository: CheckInRepository,
    private val membershipRepository: MembershipRepository,
    private val paymentRepository: PaymentRepository,
) {
    @Transactional(readOnly = true)
    fun stats(orgId: UUID, range: String = "today"): DashboardStatsResponse {
        val organization = organizationRepository.findById(orgId).orElseThrow {
            BusinessException(ErrorCodes.UNAUTHORIZED, "Organization not found", 404)
        }
        val zone = ZoneId.of(organization.timezone)
        val today = LocalDate.now(zone)

        val (start, end) = when (range.lowercase()) {
            "7d" -> Pair(
                today.minusDays(6).atStartOfDay(zone).toInstant(),
                today.plusDays(1).atStartOfDay(zone).toInstant(),
            )
            "30d" -> Pair(
                today.minusDays(29).atStartOfDay(zone).toInstant(),
                today.plusDays(1).atStartOfDay(zone).toInstant(),
            )
            else -> Pair(
                today.atStartOfDay(zone).toInstant(),
                today.plusDays(1).atStartOfDay(zone).toInstant(),
            )
        }

        return DashboardStatsResponse(
            todayCheckIns = checkInRepository.countByOrgIdAndCheckInTimeBetween(orgId, start, end),
            activeMembers = membershipRepository.countActiveMembersOn(orgId, today),
            revenueToday = paymentRepository.sumCompletedRevenueBetween(orgId, start, end),
        )
    }
}
