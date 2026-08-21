package com.gymsynk.member

import com.gymsynk.auth.requireAuthContext
import com.gymsynk.member.dto.MemberListItem
import com.gymsynk.member.dto.MemberProfileResponse
import com.gymsynk.member.dto.MemberRegistrationResponse
import com.gymsynk.member.dto.CreateMemberRequest
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/members")
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
class MemberController(
    private val memberService: MemberService,
) {
    @GetMapping
    fun searchMembers(
        auth: Authentication,
        @RequestParam(required = false) search: String?,
        @PageableDefault(size = 20) pageable: Pageable,
    ): ResponseEntity<Page<MemberListItem>> {
        val orgId = auth.requireAuthContext().orgId
        return ResponseEntity.ok(memberService.searchMembers(orgId, search, pageable))
    }

    @GetMapping("/{id}")
    fun getMember(
        @PathVariable id: UUID,
        auth: Authentication,
    ): ResponseEntity<MemberProfileResponse> {
        val orgId = auth.requireAuthContext().orgId
        return ResponseEntity.ok(memberService.getMember(orgId, id))
    }

    @PostMapping
    fun registerMember(
        auth: Authentication,
        @RequestBody @Valid request: CreateMemberRequest,
    ): ResponseEntity<MemberRegistrationResponse> {
        return ResponseEntity.ok(memberService.registerMember(auth.requireAuthContext(), request))
    }
}
