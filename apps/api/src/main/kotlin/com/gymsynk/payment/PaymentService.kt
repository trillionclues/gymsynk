package com.gymsynk.payment

import com.gymsynk.payment.strategy.PaymentRequest
import com.gymsynk.payment.strategy.PaymentResult
import com.gymsynk.payment.strategy.PaymentStrategy
import org.springframework.stereotype.Service

@Service
class PaymentService(
    private val paymentStrategy: PaymentStrategy,
) {
    fun collectCashPayment(request: PaymentRequest): PaymentResult =
        paymentStrategy.processPayment(request)
}
