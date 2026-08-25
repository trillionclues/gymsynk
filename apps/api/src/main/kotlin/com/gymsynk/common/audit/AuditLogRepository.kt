package com.gymsynk.common.audit

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

@Repository
interface AuditLogRepository : JpaRepository<AuditLog, UUID> {

    @Query("""
        SELECT a FROM AuditLog a
        WHERE a.orgId = :orgId
          AND (:action IS NULL OR a.action = :action)
          AND (:from IS NULL OR a.createdAt >= :from)
          AND (:to IS NULL OR a.createdAt <= :to)
        ORDER BY a.createdAt DESC
    """)
    fun findFiltered(
        orgId: UUID,
        action: String?,
        from: Instant?,
        to: Instant?,
        pageable: Pageable,
    ): Page<AuditLog>
}
