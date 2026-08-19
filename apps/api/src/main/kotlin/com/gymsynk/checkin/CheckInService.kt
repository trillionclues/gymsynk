package com.gymsynk.checkin

import com.gymsynk.checkin.dto.CheckInResponse
import com.gymsynk.checkin.entity.CheckIn
import com.gymsynk.checkin.repository.CheckInRepository
import com.gymsynk.common.exception.BusinessException
import com.gymsynk.common.exception.ErrorCodes
import com.gymsynk.location.repository.OperatingHoursRepository
import com.gymsynk.member.entity.User
import com.gymsynk.member.repository.UserRepository
import com.gymsynk.membership.entity.Membership
import com.gymsynk.membership.repository.MembershipRepository
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.util.UUID

@Service
class CheckInService(
    private val qrTokenService: QrTokenService,
    private val userRepository: UserRepository,
    private val membershipRepository: MembershipRepository,
    private val checkInRepository: CheckInRepository,
    private val operatingHoursRepository: OperatingHoursRepository,
    private val redis: StringRedisTemplate,
) {
    @Transactional
    fun validateQrAndRecord(token: String, cashierOrgId: UUID, locationId: UUID): CheckInResponse {

        // 1. Consume token — atomic GETDEL, single-use guaranteed
        val userId = qrTokenService.validateAndConsume(token)
            ?: throw BusinessException(ErrorCodes.TOKEN_INVALID, "QR token is invalid or expired", 422)

        // 2. Load member
        val member = userRepository.findById(userId).orElseThrow {
            BusinessException(ErrorCodes.MEMBER_NOT_FOUND, "Member not found", 404)
        }

        // 3. Verify org — prevents cross-gym QR misuse
        if (member.org.id != cashierOrgId)
            throw BusinessException(ErrorCodes.UNAUTHORIZED, "Cross-gym QR not allowed", 403)

        // 4. Load active membership
        val membership = membershipRepository.findActiveByUserAndLocation(userId, locationId)
            ?: return writeAndBroadcast(member, null, locationId, "EXPIRED_PLAN", "QR_SCAN", null, null)

        // 5. Check expiry
        val orgTz = ZoneId.of(member.org.timezone)
        val today = LocalDate.now(orgTz)
        if (membership.endDate.isBefore(today))
            return writeAndBroadcast(member, membership, locationId, "EXPIRED_PLAN", "QR_SCAN", null, null)

        // 6. Compute current session from operating hours
        val session = computeSession(locationId, LocalTime.now(orgTz))
            ?: throw BusinessException(ErrorCodes.WRONG_SESSION, "Outside operating hours", 422)

        // 7. Validate plan allows this session and day
        if (!membership.plan.allowedSessions.contains(session))
            throw BusinessException(ErrorCodes.WRONG_SESSION, "Plan not valid for $session", 422)
        if (!membership.plan.allowedDays.contains(today.dayOfWeek.value % 7))
            throw BusinessException(ErrorCodes.WRONG_DAY, "Plan not valid today", 422)

        // 8. Duplicate check — same user, location, session, day
        if (checkInRepository.existsByUserIdAndLocationIdAndSessionTypeAndDate(userId, locationId, session, today))
            throw BusinessException(ErrorCodes.ALREADY_CHECKED_IN, "Already checked in for $session", 422)

        // 9 + 10. Write record and broadcast to cashier dashboard
        return writeAndBroadcast(member, membership, locationId, "VALID", "QR_SCAN", session, null)
    }

    @Transactional
    fun manualCheckIn(memberId: UUID, locationId: UUID, cashierOrgId: UUID, overrideReason: String? = null): CheckInResponse {
        val member = userRepository.findById(memberId).orElseThrow {
            BusinessException(ErrorCodes.MEMBER_NOT_FOUND, "Member not found", 404)
        }
        val membership = membershipRepository.findActiveByUserAndLocation(memberId, locationId)
        val status = when {
            overrideReason != null -> "OVERRIDE"
            membership == null     -> "EXPIRED_PLAN"
            else                   -> "VALID"
        }
        return writeAndBroadcast(member, membership, locationId, status, "MANUAL", null, overrideReason)
    }

    private fun writeAndBroadcast(
        member: User,
        membership: Membership?,
        locationId: UUID,
        status: String,
        method: String,
        session: String?,
        overrideReason: String?,
    ): CheckInResponse {
        val checkIn = checkInRepository.save(
            CheckIn(
                userId        = member.id,
                membershipId  = membership?.id,
                locationId    = locationId,
                orgId         = member.org.id,
                sessionType   = session ?: "MORNING",
                checkInMethod = method,
                status        = status,
                overrideReason = overrideReason,
                checkInTime   = Instant.now(),
            )
        )
        val event = """{"checkInId":"${checkIn.id}","memberId":"${member.id}","name":"${member.firstName} ${member.lastName}","memberNumber":"${member.memberNumber}","status":"$status","session":"${session ?: ""}","method":"$method"}"""
        redis.convertAndSend("checkin:${member.org.id}", event)
        return CheckInResponse(
            checkInId    = checkIn.id,
            memberName   = "${member.firstName} ${member.lastName}",
            memberNumber = member.memberNumber ?: "",
            planName     = membership?.plan?.name ?: "Unknown",
            session      = session ?: "",
            status       = status,
        )
    }

    private fun computeSession(locationId: UUID, time: LocalTime): String? {
        val hours = operatingHoursRepository.findByLocationId(locationId)
        return when {
            hours.any { it.sessionType == "MORNING" && time >= it.openTime && time < it.closeTime } -> "MORNING"
            hours.any { it.sessionType == "EVENING" && time >= it.openTime && time < it.closeTime } -> "EVENING"
            else -> null
        }
    }
}
