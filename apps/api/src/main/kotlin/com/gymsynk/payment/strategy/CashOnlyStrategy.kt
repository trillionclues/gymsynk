package com.gymsynk.payment.strategy

import com.gymsynk.payment.entity.Payment
import com.gymsynk.payment.repository.PaymentRepository
import org.springframework.stereotype.Component

@Component
class CashOnlyStrategy(private val paymentRepository: PaymentRepository) : PaymentStrategy {

    override fun processPayment(request: PaymentRequest): PaymentResult {
        val payment = paymentRepository.save(
            Payment(
                membershipId  = request.membershipId,
                userId        = request.userId,
                orgId         = request.orgId,
                amount        = request.amount,
                currency      = request.currency,
                paymentMethod = "CASH",
                paymentStatus = "COMPLETED",
                receivedBy    = request.cashierId,
            )
        )
        return PaymentResult(payment.id, "COMPLETED")
    }

    override fun generateReceipt(payment: Payment): ByteArray? = null
    override fun requiresExternalConfirmation() = false
}