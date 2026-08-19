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
    @Column(name = "is_active") var isActive: Boolean = true,

    @Column(name = "created_at", updatable = false) val createdAt: Instant = Instant.now(),
)
