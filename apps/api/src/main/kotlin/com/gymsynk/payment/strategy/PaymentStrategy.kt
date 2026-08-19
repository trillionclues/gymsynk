package com.gymsynk.payment.strategy

import com.gymsynk.payment.entity.Payment
import java.util.UUID

data class PaymentRequest(
    val membershipId: UUID,
    val userId: UUID,
    val orgId: UUID,
    val amount: java.math.BigDecimal,
    val currency: String,
    val cashierId: UUID,
)
data class PaymentResult(val paymentId: UUID, val status: String)

sealed interface PaymentStrategy {
    fun processPayment(request: PaymentRequest): PaymentResult
    fun generateReceipt(payment: Payment): ByteArray?
    fun requiresExternalConfirmation(): Boolean
}