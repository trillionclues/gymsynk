package com.gymsynk.membership

import com.gymsynk.auth.requireAuthContext
import com.gymsynk.membership.dto.PlanResponse
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/plans")
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
class PlanController(
    private val planQueryService: PlanQueryService,
) {
    @GetMapping
    fun listPlans(auth: Authentication): ResponseEntity<List<PlanResponse>> =
        ResponseEntity.ok(planQueryService.activePlans(auth.requireAuthContext().orgId))
}
