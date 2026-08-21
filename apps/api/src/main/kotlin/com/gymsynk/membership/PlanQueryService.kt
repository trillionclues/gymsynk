package com.gymsynk.membership

import com.gymsynk.membership.dto.PlanResponse
import com.gymsynk.membership.repository.MembershipPlanRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class PlanQueryService(
    private val membershipPlanRepository: MembershipPlanRepository,
) {
    @Transactional(readOnly = true)
    fun activePlans(orgId: UUID): List<PlanResponse> =
        membershipPlanRepository.findByOrgIdAndIsActiveTrue(orgId)
            .sortedBy { it.name.lowercase() }
            .map {
                PlanResponse(
                    id = it.id,
                    name = it.name,
                    durationType = it.durationType,
                    durationValue = it.durationValue,
                    price = it.price,
                    currency = it.currency,
                    allowedSessions = it.allowedSessions,
                    allowedDays = it.allowedDays,
                    maxCheckInsPerDay = it.maxCheckInsPerDay,
                )
            }
}
