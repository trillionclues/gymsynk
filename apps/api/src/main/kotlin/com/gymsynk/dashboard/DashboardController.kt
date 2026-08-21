package com.gymsynk.dashboard

import com.gymsynk.auth.requireAuthContext
import com.gymsynk.dashboard.dto.DashboardStatsResponse
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/dashboard")
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
class DashboardController(
    private val dashboardService: DashboardService,
) {
    @GetMapping("/stats")
    fun stats(auth: Authentication): ResponseEntity<DashboardStatsResponse> =
        ResponseEntity.ok(dashboardService.stats(auth.requireAuthContext().orgId))
}
