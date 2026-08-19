package com.gymsynk.membership.entity

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "memberships")
class Membership(
    @Id val id: UUID = UUID.randomUUID(),

    @Column(name = "user_id", nullable = false) val userId: UUID,
    @Column(name = "org_id", nullable = false) val orgId: UUID,
    @Column(name = "location_id", nullable = false) val locationId: UUID,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    val plan: MembershipPlan,

    @Column(name = "start_date", nullable = false) val startDate: LocalDate,
    @Column(name = "end_date", nullable = false) val endDate: LocalDate,

    // ACTIVE | EXPIRED | CANCELLED | PAUSED
    @Column(nullable = false) var status: String = "ACTIVE",

    @Column(name = "created_at", updatable = false) val createdAt: Instant = Instant.now(),
)
