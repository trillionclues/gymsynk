package com.gymsynk.location.entity

import jakarta.persistence.*
import java.time.LocalTime
import java.util.UUID

@Entity
@Table(name = "operating_hours")
class OperatingHours(
    @Id val id: UUID = UUID.randomUUID(),

    @Column(name = "location_id", nullable = false) val locationId: UUID,

    @Column(name = "session_type", nullable = false) val sessionType: String,  // MORNING | EVENING

    @Column(name = "day_of_week", nullable = false) val dayOfWeek: Int,        // 0=Sun … 6=Sat

    @Column(name = "open_time", nullable = false) val openTime: LocalTime,
    @Column(name = "close_time", nullable = false) val closeTime: LocalTime,

    @Column(name = "is_active") val isActive: Boolean = true,
)
