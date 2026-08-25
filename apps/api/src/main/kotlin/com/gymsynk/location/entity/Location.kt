package com.gymsynk.location.entity

import com.gymsynk.organization.entity.Organization
import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "locations")
class Location(
    @Id val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    val org: Organization,

    @Column(nullable = false) var name: String,
    var address: String? = null,
    var latitude: Double? = null,
    var longitude: Double? = null,
    var city: String? = null,
    var country: String? = null,
    @Column(name = "place_id") var placeId: String? = null,
    @Column(name = "geofence_radius_meters") var geofenceRadiusMeters: Int = 100,
    @Column(name = "is_active") var isActive: Boolean = true,

    @Column(name = "created_at", updatable = false) val createdAt: Instant = Instant.now(),
)
