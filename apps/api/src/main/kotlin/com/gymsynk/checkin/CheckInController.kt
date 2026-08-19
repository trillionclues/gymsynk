package com.gymsynk.checkin

import com.gymsynk.checkin.dto.*
import com.gymsynk.common.util.QrCodeGenerator
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/checkin")
class CheckInController(
    private val checkInService: CheckInService,
    private val qrTokenService: QrTokenService,
    private val qrCodeGenerator: QrCodeGenerator,
) {
    @PostMapping("/qr-token")
    @PreAuthorize("hasRole('MEMBER')")
    fun generateQrToken(auth: Authentication): ResponseEntity<QrTokenResponse> {
        val userId  = UUID.fromString(auth.name)
        val token   = qrTokenService.generateToken(userId)
        val qrBytes = qrCodeGenerator.generate(token)
        val base64  = "data:image/png;base64,${java.util.Base64.getEncoder().encodeToString(qrBytes)}"
        return ResponseEntity.ok(QrTokenResponse(token, base64, 120))
    }

    @PostMapping("/validate")
    @PreAuthorize("hasAnyRole('CASHIER', 'ADMIN')")
    fun validateQr(@RequestBody @Valid req: QrValidateRequest, auth: Authentication): ResponseEntity<CheckInResponse> {
        val orgId = UUID.fromString((auth.details as Map<*, *>)["orgId"] as String)
        return ResponseEntity.ok(checkInService.validateQrAndRecord(req.token, orgId, req.locationId))
    }

    @PostMapping("/manual")
    @PreAuthorize("hasAnyRole('CASHIER', 'ADMIN')")
    fun manualCheckIn(
        @RequestBody @Valid req: ManualCheckInRequest,
        @RequestHeader(value = "X-Override", required = false) override: Boolean?,
        auth: Authentication,
    ): ResponseEntity<CheckInResponse> {
        val orgId = UUID.fromString((auth.details as Map<*, *>)["orgId"] as String)
        val reason = if (override == true) req.overrideReason else null
        return ResponseEntity.ok(checkInService.manualCheckIn(req.memberId, req.locationId, orgId, reason))
    }
}