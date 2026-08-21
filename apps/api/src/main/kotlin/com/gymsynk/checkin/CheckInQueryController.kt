package com.gymsynk.checkin

import com.gymsynk.auth.requireAuthContext
import com.gymsynk.checkin.dto.TodayCheckInResponse
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/checkins")
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
class CheckInQueryController(
    private val checkInQueryService: CheckInQueryService,
) {
    @GetMapping("/today")
    fun today(auth: Authentication): ResponseEntity<List<TodayCheckInResponse>> =
        ResponseEntity.ok(checkInQueryService.today(auth.requireAuthContext().orgId))
}
