package com.gymsynk.common.audit

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "audit_log")
class AuditLog(
    @Id val id: UUID = UUID.randomUUID(),
    @Column(name = "org_id", nullable = false) val orgId: UUID,
    @Column(name = "actor_id") val actorId: UUID? = null,
    @Column(nullable = false, length = 50) val action: String,
    @Column(name = "entity_type", nullable = false, length = 50) val entityType: String,
    @Column(name = "entity_id") val entityId: UUID? = null,
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "old_value", columnDefinition = "jsonb") val oldValue: String? = null,
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "new_value", columnDefinition = "jsonb") val newValue: String? = null,
    @Column(name = "ip_address", columnDefinition = "inet") val ipAddress: String? = null,
    @Column(name = "created_at", updatable = false) val createdAt: Instant = Instant.now(),
)
