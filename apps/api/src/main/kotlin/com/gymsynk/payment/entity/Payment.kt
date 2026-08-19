package com.gymsynk.payment.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "payments")
class Payment(
    @Id val id: UUID = UUID.randomUUID(),

    @Column(name = "membership_id", nullable = false) val membershipId: UUID,
    @Column(name = "user_id", nullable = false) val userId: UUID,
    @Column(name = "org_id", nullable = false) val orgId: UUID,

    @Column(nullable = false, precision = 12, scale = 4) val amount: BigDecimal,
    @Column(nullable = false, length = 3) val currency: String = "NGN",

    // CASH | CARD | GATEWAY
    @Column(name = "payment_method", nullable = false) val paymentMethod: String,

    // PENDING | COMPLETED | FAILED | REFUNDED
    @Column(name = "payment_status", nullable = false) var paymentStatus: String = "PENDING",

    // For FULL_PROCESSING — gateway transaction reference
    @Column(name = "external_ref") val externalRef: String? = null,

    @Column(name = "received_by") val receivedBy: UUID? = null,

    @Column(name = "created_at", updatable = false) val createdAt: Instant = Instant.now(),
)
