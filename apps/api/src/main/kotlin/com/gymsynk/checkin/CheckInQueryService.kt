package com.gymsynk.checkin

import com.gymsynk.checkin.dto.TodayCheckInResponse
import com.gymsynk.checkin.entity.CheckIn
import com.gymsynk.checkin.repository.CheckInRepository
import com.gymsynk.common.exception.BusinessException
import com.gymsynk.common.exception.ErrorCodes
import com.gymsynk.member.repository.UserRepository
import com.gymsynk.membership.repository.MembershipRepository
import com.gymsynk.organization.repository.OrganizationRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.ZoneId
import java.util.UUID

@Service
class CheckInQueryService(
    private val organizationRepository: OrganizationRepository,
    private val checkInRepository: CheckInRepository,
    private val userRepository: UserRepository,
    private val membershipRepository: MembershipRepository,
) {
    @Transactional(readOnly = true)
    fun today(orgId: UUID): List<TodayCheckInResponse> {
        val organization = organizationRepository.findById(orgId).orElseThrow {
            BusinessException(ErrorCodes.UNAUTHORIZED, "Organization not found", 404)
        }
        val zone = ZoneId.of(organization.timezone)
        val today = LocalDate.now(zone)
        val start = today.atStartOfDay(zone).toInstant()
        val end = today.plusDays(1).atStartOfDay(zone).toInstant()

        val checkIns = checkInRepository.findByOrgIdAndCheckInTimeBetweenOrderByCheckInTimeDesc(orgId, start, end)
        val usersById = userRepository.findAllById(checkIns.map { it.userId }.distinct()).associateBy { it.id }
        val membershipsById = membershipRepository.findAllById(
            checkIns.mapNotNull { it.membershipId }.distinct()
        ).associateBy { it.id }

        return checkIns.map { checkIn ->
            val user = usersById[checkIn.userId]
            val membership = checkIn.membershipId?.let { membershipsById[it] }
            TodayCheckInResponse(
                checkInId = checkIn.id,
                checkInTime = checkIn.checkInTime,
                memberName = user?.let { "${it.firstName} ${it.lastName}" } ?: "Unknown member",
                memberNumber = user?.memberNumber ?: "",
                planName = membership?.plan?.name ?: "Unknown",
                session = checkIn.sessionType,
                status = checkIn.status,
                method = checkIn.checkInMethod,
                locationId = checkIn.locationId,
                overrideReason = checkIn.overrideReason,
            )
        }
    }
}
