package com.gymsynk.membership.repository

import com.gymsynk.membership.entity.MembershipPlan
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface MembershipPlanRepository : JpaRepository<MembershipPlan, UUID> {
    fun findByOrgIdAndIsActiveTrue(orgId: UUID): List<MembershipPlan>
}
