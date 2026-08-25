package com.gymsynk.membership

import com.gymsynk.common.exception.BusinessException
import com.gymsynk.common.exception.ErrorCodes
import com.gymsynk.membership.dto.CreatePlanRequest
import com.gymsynk.membership.dto.PlanResponse
import com.gymsynk.membership.dto.UpdatePlanRequest
import com.gymsynk.membership.entity.MembershipPlan
import com.gymsynk.membership.repository.MembershipPlanRepository
import com.gymsynk.organization.repository.OrganizationRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class PlanQueryService(
    private val membershipPlanRepository: MembershipPlanRepository,
    private val organizationRepository: OrganizationRepository,
) {
    @Transactional(readOnly = true)
    fun activePlans(orgId: UUID): List<PlanResponse> =
        membershipPlanRepository.findByOrgIdAndIsActiveTrue(orgId)
            .sortedBy { it.name.lowercase() }
            .map { toResponse(it) }

    @Transactional(readOnly = true)
    fun allPlans(orgId: UUID): List<PlanResponse> =
        membershipPlanRepository.findByOrgId(orgId)
            .sortedBy { it.name.lowercase() }
            .map { toResponse(it) }

    @Transactional
    fun createPlan(orgId: UUID, req: CreatePlanRequest): PlanResponse {
        val org = organizationRepository.findById(orgId).orElseThrow {
            BusinessException(ErrorCodes.UNAUTHORIZED, "Organization not found", 404)
        }

        val plan = membershipPlanRepository.save(
            MembershipPlan(
                org = org,
                name = req.name,
                durationType = req.durationType,
                durationValue = req.durationValue,
                price = req.price,
                currency = req.currency,
                allowedSessionsRaw = req.allowedSessions,
                allowedDaysRaw = req.allowedDays,
                maxCheckInsPerDay = req.maxCheckinsPerDay,
                isActive = true,
            )
        )
        return toResponse(plan)
    }

    @Transactional
    fun updatePlan(orgId: UUID, planId: UUID, req: UpdatePlanRequest): PlanResponse {
        val plan = membershipPlanRepository.findById(planId).orElseThrow {
            BusinessException("PLAN_NOT_FOUND", "Plan not found", 404)
        }

        if (plan.org.id != orgId) {
            throw BusinessException(ErrorCodes.UNAUTHORIZED, "Access denied to plan", 403)
        }

        req.name?.let { plan.name = it }
        req.durationType?.let { plan.durationType = it }
        req.durationValue?.let { plan.durationValue = it }
        req.price?.let { plan.price = it }
        req.currency?.let { plan.currency = it }
        req.allowedSessions?.let { plan.allowedSessionsRaw = it }
        req.allowedDays?.let { plan.allowedDaysRaw = it }
        req.maxCheckinsPerDay?.let { plan.maxCheckInsPerDay = it }

        return toResponse(membershipPlanRepository.save(plan))
    }

    @Transactional
    fun togglePlanActive(orgId: UUID, planId: UUID): PlanResponse {
        val plan = membershipPlanRepository.findById(planId).orElseThrow {
            BusinessException("PLAN_NOT_FOUND", "Plan not found", 404)
        }

        if (plan.org.id != orgId) {
            throw BusinessException(ErrorCodes.UNAUTHORIZED, "Access denied to plan", 403)
        }

        plan.isActive = !plan.isActive
        return toResponse(membershipPlanRepository.save(plan))
    }

    private fun toResponse(plan: MembershipPlan) = PlanResponse(
        id = plan.id,
        name = plan.name,
        durationType = plan.durationType,
        durationValue = plan.durationValue,
        price = plan.price,
        currency = plan.currency,
        allowedSessions = plan.allowedSessions,
        allowedDays = plan.allowedDays,
        maxCheckInsPerDay = plan.maxCheckInsPerDay,
        isActive = plan.isActive,
    )
}
