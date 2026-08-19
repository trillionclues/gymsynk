package com.gymsynk.checkin.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "check_ins")
class CheckIn(
    @Id val id: UUID = UUID.randomUUID(),

    @Column(name = "user_id", nullable = false) val userId: UUID,
    @Column(name = "membership_id") val membershipId: UUID?,
    @Column(name = "location_id", nullable = false) val locationId: UUID,
    @Column(name = "org_id", nullable = false) val orgId: UUID,

    // MORNING | EVENING
    @Column(name = "session_type", nullable = false) val sessionType: String,

    // QR_SCAN | MANUAL
    @Column(name = "check_in_method", nullable = false) val checkInMethod: String,

    // VALID | EXPIRED_PLAN | OVERRIDE | WRONG_SESSION | WRONG_DAY | ALREADY_CHECKED_IN
    @Column(nullable = false) val status: String,

    @Column(name = "override_reason") val overrideReason: String? = null,

    @Column(name = "check_in_time", nullable = false) val checkInTime: Instant = Instant.now(),
)
