package com.gymsynk.payment

import com.gymsynk.auth.requireAuthContext
import com.gymsynk.payment.dto.PaymentPageResponse
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/payments")
class PaymentController(private val paymentQueryService: PaymentQueryService) {

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    fun listPayments(
        auth: Authentication,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) status: String?,
    ): ResponseEntity<PaymentPageResponse> {
        val orgId = auth.requireAuthContext().orgId
        return ResponseEntity.ok(paymentQueryService.listPayments(orgId, page, size, status))
    }
}
