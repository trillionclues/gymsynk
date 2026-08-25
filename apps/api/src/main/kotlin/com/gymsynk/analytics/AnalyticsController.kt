package com.gymsynk.analytics

import com.gymsynk.analytics.dto.*
import com.gymsynk.auth.requireAuthContext
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/analytics")
class AnalyticsController(private val analyticsService: AnalyticsService) {

    @GetMapping("/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    fun attendance(
        auth: Authentication,
        @RequestParam from: String,
        @RequestParam to: String,
    ): ResponseEntity<AttendanceSeriesResponse> {
        val orgId = auth.requireAuthContext().orgId
        val fromDate = LocalDate.parse(from)
        val toDate = LocalDate.parse(to)
        require(!toDate.isBefore(fromDate)) { "to must be >= from" }
        require(!toDate.isAfter(fromDate.plusDays(30))) { "Max range is 30 days" }
        return ResponseEntity.ok(analyticsService.attendanceSeries(orgId, fromDate, toDate))
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    fun revenue(
        auth: Authentication,
        @RequestParam from: String,
        @RequestParam to: String,
    ): ResponseEntity<RevenueSeriesResponse> {
        val orgId = auth.requireAuthContext().orgId
        val fromDate = LocalDate.parse(from)
        val toDate = LocalDate.parse(to)
        require(!toDate.isBefore(fromDate)) { "to must be >= from" }
        require(!toDate.isAfter(fromDate.plusDays(30))) { "Max range is 30 days" }
        return ResponseEntity.ok(analyticsService.revenueSeries(orgId, fromDate, toDate))
    }

    @GetMapping("/heatmap")
    @PreAuthorize("hasRole('ADMIN')")
    fun heatmap(auth: Authentication): ResponseEntity<HeatmapResponse> {
        val orgId = auth.requireAuthContext().orgId
        return ResponseEntity.ok(analyticsService.heatmap(orgId))
    }
}
