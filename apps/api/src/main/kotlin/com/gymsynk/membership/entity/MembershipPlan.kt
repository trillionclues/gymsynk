package com.gymsynk.membership.entity

import com.gymsynk.organization.entity.Organization
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "membership_plans")
class MembershipPlan(
    @Id val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    val org: Organization,

    @Column(nullable = false) var name: String,

    // DAILY | WEEKLY | MONTHLY | CUSTOM
    @Column(name = "duration_type", nullable = false) var durationType: String,
    @Column(name = "duration_value", nullable = false) var durationValue: Int = 1,

    var price: BigDecimal = BigDecimal.ZERO,
    var currency: String = "NGN",

    // Comma-separated: "MORNING,EVENING" or "MORNING"
    @Column(name = "allowed_sessions") var allowedSessionsRaw: String = "MORNING,EVENING",

    // Comma-separated day-of-week ints: "1,2,3,4,5" (Mon–Fri)
    @Column(name = "allowed_days") var allowedDaysRaw: String = "0,1,2,3,4,5,6",

    @Column(name = "max_checkins_per_day") var maxCheckInsPerDay: Int = 1,
    @Column(name = "is_active") var isActive: Boolean = true,

    @Column(name = "created_at", updatable = false) val createdAt: Instant = Instant.now(),
) {
    val allowedSessions: List<String>
        get() = allowedSessionsRaw.split(",").map { it.trim() }

    val allowedDays: List<Int>
        get() = allowedDaysRaw.split(",").map { it.trim().toInt() }
}
