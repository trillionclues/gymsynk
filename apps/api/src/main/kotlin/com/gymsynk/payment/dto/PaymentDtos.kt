package com.gymsynk.payment.dto

import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

data class PaymentResponse(
    val id: UUID,
    val memberName: String,
    val amount: BigDecimal,
    val currency: String,
    val paymentMethod: String,
    val paymentStatus: String,
    val externalRef: String?,
    val createdAt: Instant,
)

data class PaymentPageResponse(
    val content: List<PaymentResponse>,
    val totalPages: Int,
    val totalElements: Long,
    val page: Int,
    val size: Int,
)
