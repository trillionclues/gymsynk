package com.gymsynk.checkin

import com.gymsynk.checkin.dto.CheckInHistoryItem
import com.gymsynk.checkin.dto.CheckInHistoryResponse
import com.gymsynk.checkin.dto.TodayCheckInResponse
import com.gymsynk.checkin.entity.CheckIn
import com.gymsynk.checkin.repository.CheckInRepository
import com.gymsynk.common.exception.BusinessException
import com.gymsynk.common.exception.ErrorCodes
import com.gymsynk.location.repository.LocationRepository
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
    private val locationRepository: LocationRepository,
) {
    @Transactional(readOnly = true)
    fun today(orgId: UUID, range: String = "today"): List<TodayCheckInResponse> {
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

    @Transactional(readOnly = true)
    fun history(userId: UUID, page: Int, size: Int): CheckInHistoryResponse {
        val pageable = org.springframework.data.domain.PageRequest.of(page, size)
        val checkInsPage = checkInRepository.findByUserIdOrderByCheckInTimeDesc(userId, pageable)

        val membershipsById = membershipRepository.findAllById(
            checkInsPage.content.mapNotNull { it.membershipId }.distinct()
        ).associateBy { it.id }

        val locationsById = locationRepository.findAllById(
            checkInsPage.content.map { it.locationId }.distinct()
        ).associateBy { it.id }

        val items = checkInsPage.content.map { checkIn ->
            val membership = checkIn.membershipId?.let { membershipsById[it] }
            val location   = locationsById[checkIn.locationId]
            CheckInHistoryItem(
                checkInId    = checkIn.id,
                checkInTime  = checkIn.checkInTime,
                locationName = location?.name ?: "Unknown location",
                planName     = membership?.plan?.name ?: "Unknown",
                session      = checkIn.sessionType,
                status       = checkIn.status,
                method       = checkIn.checkInMethod,
            )
        }

        return CheckInHistoryResponse(
            items         = items,
            totalPages    = checkInsPage.totalPages,
            totalElements = checkInsPage.totalElements,
        )
    }
}
