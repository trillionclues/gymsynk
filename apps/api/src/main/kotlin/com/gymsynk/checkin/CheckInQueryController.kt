package com.gymsynk.checkin

import com.gymsynk.auth.requireAuthContext
import com.gymsynk.checkin.dto.CheckInHistoryResponse
import com.gymsynk.checkin.dto.TodayCheckInResponse
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/checkins")
class CheckInQueryController(
    private val checkInQueryService: CheckInQueryService,
) {
    //Staff endpoint for today's check-ins
    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    fun today(auth: Authentication): ResponseEntity<List<TodayCheckInResponse>> =
        ResponseEntity.ok(checkInQueryService.today(auth.requireAuthContext().orgId))

    // Member own check-in history
    @GetMapping("/history")
    @PreAuthorize("hasRole('MEMBER')")
    fun history(
        auth: Authentication,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): ResponseEntity<CheckInHistoryResponse> {
        val userId = auth.requireAuthContext().userId
        return ResponseEntity.ok(checkInQueryService.history(userId, page, size))
    }
}
