package com.gymsynk.member

import com.gymsynk.auth.requireAuthContext
import com.gymsynk.member.dto.CreateStaffRequest
import com.gymsynk.member.dto.StaffMemberResponse
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/staff")
@PreAuthorize("hasRole('ADMIN')")
class StaffController(
    private val staffService: StaffService,
) {
    @GetMapping
    fun listStaff(auth: Authentication): ResponseEntity<List<StaffMemberResponse>> =
        ResponseEntity.ok(staffService.listStaff(auth.requireAuthContext().orgId))

    @PostMapping
    fun createStaff(
        @Valid @RequestBody req: CreateStaffRequest,
        auth: Authentication,
    ): ResponseEntity<StaffMemberResponse> =
        ResponseEntity.ok(staffService.createStaff(auth.requireAuthContext().orgId, req))

    @PatchMapping("/{id}/toggle-active")
    fun toggleStaffActive(
        @PathVariable id: UUID,
        auth: Authentication,
    ): ResponseEntity<StaffMemberResponse> =
        ResponseEntity.ok(staffService.toggleStaffActive(auth.requireAuthContext().orgId, id))
}
