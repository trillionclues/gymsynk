package com.gymsynk.organization.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "organizations")
class Organization(
    @Id val id: UUID = UUID.randomUUID(),

    @Column(nullable = false) var name: String,
    @Column(nullable = false, unique = true) var slug: String,
    @Column(name = "default_currency", length = 3) var defaultCurrency: String = "NGN",
    @Column(length = 50) var timezone: String = "Africa/Lagos",
    @Column(name = "payment_mode", length = 20) var paymentMode: String = "CASH_ONLY",
    @Column(name = "setup_complete") var setupComplete: Boolean = false,

    @Column(name = "created_at", updatable = false) val createdAt: Instant = Instant.now(),
)