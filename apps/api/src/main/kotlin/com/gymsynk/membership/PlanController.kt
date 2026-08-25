package com.gymsynk.membership

import com.gymsynk.auth.requireAuthContext
import com.gymsynk.membership.dto.CreatePlanRequest
import com.gymsynk.membership.dto.PlanResponse
import com.gymsynk.membership.dto.UpdatePlanRequest
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/plans")
class PlanController(
    private val planQueryService: PlanQueryService,
) {
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    fun listPlans(auth: Authentication): ResponseEntity<List<PlanResponse>> =
        ResponseEntity.ok(planQueryService.activePlans(auth.requireAuthContext().orgId))

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    fun listAllPlans(auth: Authentication): ResponseEntity<List<PlanResponse>> =
        ResponseEntity.ok(planQueryService.allPlans(auth.requireAuthContext().orgId))

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun createPlan(
        @Valid @RequestBody req: CreatePlanRequest,
        auth: Authentication,
    ): ResponseEntity<PlanResponse> =
        ResponseEntity.ok(planQueryService.createPlan(auth.requireAuthContext().orgId, req))

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun updatePlan(
        @PathVariable id: UUID,
        @RequestBody req: UpdatePlanRequest,
        auth: Authentication,
    ): ResponseEntity<PlanResponse> =
        ResponseEntity.ok(planQueryService.updatePlan(auth.requireAuthContext().orgId, id, req))

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    fun togglePlanActive(
        @PathVariable id: UUID,
        auth: Authentication,
    ): ResponseEntity<PlanResponse> =
        ResponseEntity.ok(planQueryService.togglePlanActive(auth.requireAuthContext().orgId, id))
}
