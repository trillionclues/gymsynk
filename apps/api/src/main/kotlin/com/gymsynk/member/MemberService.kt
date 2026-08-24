package com.gymsynk.member

import com.gymsynk.auth.AuthContext
import com.gymsynk.common.exception.BusinessException
import com.gymsynk.common.exception.ErrorCodes
import com.gymsynk.location.repository.LocationRepository
import com.gymsynk.member.dto.*
import com.gymsynk.member.entity.User
import com.gymsynk.member.entity.UserRole
import com.gymsynk.member.repository.UserRepository
import com.gymsynk.membership.entity.Membership
import com.gymsynk.membership.entity.MembershipPlan
import com.gymsynk.membership.repository.MembershipPlanRepository
import com.gymsynk.membership.repository.MembershipRepository
import com.gymsynk.organization.entity.Organization
import com.gymsynk.payment.PaymentService
import com.gymsynk.payment.strategy.PaymentRequest
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.ZoneId
import java.util.UUID

@Service
class MemberService(
    private val userRepository: UserRepository,
    private val membershipRepository: MembershipRepository,
    private val membershipPlanRepository: MembershipPlanRepository,
    private val locationRepository: LocationRepository,
    private val paymentService: PaymentService,
) {
    @PersistenceContext
    private lateinit var entityManager: EntityManager

    @Transactional(readOnly = true)
    fun searchMembers(orgId: UUID, search: String?, pageable: Pageable): Page<MemberListItem> =
        userRepository.searchMembers(orgId, search?.trim().takeUnless { it.isNullOrBlank() }, pageable)
            .map { member -> toMemberListItem(member, orgId) }

    @Transactional(readOnly = true)
    fun getMember(orgId: UUID, memberId: UUID): MemberProfileResponse {
        val member = userRepository.findById(memberId).orElseThrow {
            BusinessException(ErrorCodes.MEMBER_NOT_FOUND, "Member not found", 404)
        }

        if (member.org.id != orgId || member.role != UserRole.MEMBER)
            throw BusinessException(ErrorCodes.MEMBER_NOT_FOUND, "Member not found", 404)

        return toMemberProfile(member, orgId)
    }

    @Transactional
    fun registerMember(auth: AuthContext, request: CreateMemberRequest): MemberRegistrationResponse {
        val location = locationRepository.findById(request.locationId).orElseThrow {
            BusinessException(ErrorCodes.UNAUTHORIZED, "Location not found", 404)
        }
        if (location.org.id != auth.orgId)
            throw BusinessException(ErrorCodes.UNAUTHORIZED, "Cross-gym registration not allowed", 403)

        val plan = membershipPlanRepository.findById(request.planId).orElseThrow {
            BusinessException(ErrorCodes.MEMBER_NOT_FOUND, "Plan not found", 404)
        }
        if (plan.org.id != auth.orgId || !plan.isActive)
            throw BusinessException(ErrorCodes.MEMBER_NOT_FOUND, "Plan not found", 404)

        val organization = location.org
        val today = request.startDate ?: LocalDate.now(ZoneId.of(organization.timezone))
        val memberNumber = nextMemberNumber()
        val member = userRepository.save(
            User(
                org = organization,
                email = normalizeContact(request.email),
                phone = normalizeContact(request.phone),
                firstName = request.firstName.trim(),
                lastName = request.lastName.trim(),
                role = UserRole.MEMBER,
                memberNumber = memberNumber,
            )
        )

        val membership = membershipRepository.save(
            Membership(
                userId = member.id,
                orgId = organization.id,
                locationId = location.id,
                plan = plan,
                startDate = today,
                endDate = calculateEndDate(today, plan),
                status = "ACTIVE",
            )
        )

        val payment = paymentService.collectCashPayment(
            PaymentRequest(
                membershipId = membership.id,
                userId = member.id,
                orgId = organization.id,
                amount = request.paymentAmount ?: plan.price,
                currency = plan.currency,
                cashierId = auth.userId,
            )
        )

        return MemberRegistrationResponse(
            member = toMemberProfile(member, organization.id),
            paymentId = payment.paymentId,
            paymentStatus = payment.status,
        )
    }

    private fun toMemberListItem(member: User, orgId: UUID): MemberListItem {
        val membership = membershipRepository.findLatestActiveByUserIdAndOrgId(member.id, orgId)
        return MemberListItem(
            id = member.id,
            firstName = member.firstName,
            lastName = member.lastName,
            email = member.email,
            phone = member.phone,
            memberNumber = member.memberNumber,
            isActive = member.isActive,
            activePlanName = membership?.plan?.name,
            activeMembershipEndsOn = membership?.endDate,
        )
    }

    private fun toMemberProfile(member: User, orgId: UUID): MemberProfileResponse {
        val membership = membershipRepository.findLatestActiveByUserIdAndOrgId(member.id, orgId)
        return MemberProfileResponse(
            member = toMemberListItem(member, orgId),
            activeMembership = membership?.toActiveMembershipView(),
        )
    }

    private fun Membership.toActiveMembershipView(): ActiveMembershipView {
        val today = LocalDate.now(ZoneId.of("UTC"))
        val days  = java.time.temporal.ChronoUnit.DAYS.between(today, endDate).coerceAtLeast(0)
        return ActiveMembershipView(
            membershipId  = id,
            planName      = plan.name,
            locationId    = locationId,
            startDate     = startDate,
            endDate       = endDate,
            status        = status,
            price         = plan.price,
            currency      = plan.currency,
            daysRemaining = days,
        )
    }

    private fun nextMemberNumber(): String {
        val nextValue = (entityManager.createNativeQuery("select nextval('member_number_seq')").singleResult as Number).toLong()
        return "GS-%05d".format(nextValue)
    }

    private fun calculateEndDate(startDate: LocalDate, plan: MembershipPlan): LocalDate =
        when (plan.durationType.uppercase()) {
            "DAILY" -> startDate.plusDays(plan.durationValue.toLong())
            "WEEKLY" -> startDate.plusWeeks(plan.durationValue.toLong())
            "MONTHLY" -> startDate.plusMonths(plan.durationValue.toLong())
            "CUSTOM" -> startDate.plusDays(plan.durationValue.toLong())
            else -> startDate.plusDays(plan.durationValue.toLong())
        }

    private fun normalizeContact(value: String?): String? =
        value?.trim()?.takeIf { it.isNotEmpty() }
}
