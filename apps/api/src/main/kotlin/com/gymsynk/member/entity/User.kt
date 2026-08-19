package com.gymsynk.member.entity

import com.gymsynk.organization.entity.Organization
import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

enum class UserRole { ADMIN, CASHIER, MEMBER, FLOOR_STAFF }

@Entity
@Table(name = "users")
class User(
    @Id val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    val org: Organization,

    @Column(unique = true) var email: String? = null,
    var phone: String? = null,
    @Column(name = "password_hash") var passwordHash: String? = null,
    @Column(name = "first_name", nullable = false) var firstName: String,
    @Column(name = "last_name", nullable = false) var lastName: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false) var role: UserRole = UserRole.MEMBER,

    @Column(name = "member_number", unique = true) var memberNumber: String? = null,
    @Column(name = "is_active") var isActive: Boolean = true,

    @Column(name = "created_at", updatable = false) val createdAt: Instant = Instant.now(),
)
