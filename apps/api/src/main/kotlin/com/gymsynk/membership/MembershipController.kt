package com.gymsynk.membership

import com.gymsynk.auth.requireAuthContext
import com.gymsynk.membership.dto.ExpiringMembershipResponse
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/memberships")
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
class MembershipController(
    private val membershipQueryService: MembershipQueryService,
) {
    @GetMapping("/expiring")
    fun expiring(
        auth: Authentication,
        @RequestParam(defaultValue = "7") days: Long,
    ): ResponseEntity<List<ExpiringMembershipResponse>> =
        ResponseEntity.ok(membershipQueryService.expiring(auth.requireAuthContext().orgId, days))
}
