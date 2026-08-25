package com.gymsynk.common.audit

import com.gymsynk.auth.requireAuthContext
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.time.LocalDate

data class AuditLogResponse(
    val id: java.util.UUID,
    val actorId: java.util.UUID?,
    val action: String,
    val entityType: String,
    val entityId: java.util.UUID?,
    val oldValue: String?,
    val newValue: String?,
    val createdAt: Instant,
)

data class AuditPageResponse(
    val content: List<AuditLogResponse>,
    val totalPages: Int,
    val totalElements: Long,
    val page: Int,
    val size: Int,
)

@RestController
@RequestMapping("/audit")
class AuditController(private val auditLogRepository: AuditLogRepository) {

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun listAudit(
        auth: Authentication,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "30") size: Int,
        @RequestParam(required = false) action: String?,
        @RequestParam(required = false) from: String?,
        @RequestParam(required = false) to: String?,
    ): ResponseEntity<AuditPageResponse> {
        val orgId = auth.requireAuthContext().orgId
        val fromInstant = from?.let { LocalDate.parse(it).atStartOfDay().toInstant(java.time.ZoneOffset.UTC) }
        val toInstant = to?.let { LocalDate.parse(it).plusDays(1).atStartOfDay().toInstant(java.time.ZoneOffset.UTC) }
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        val resultPage = auditLogRepository.findFiltered(orgId, action?.takeIf { it.isNotBlank() }, fromInstant, toInstant, pageable)
        val content = resultPage.content.map { a ->
            AuditLogResponse(
                id = a.id,
                actorId = a.actorId,
                action = a.action,
                entityType = a.entityType,
                entityId = a.entityId,
                oldValue = a.oldValue,
                newValue = a.newValue,
                createdAt = a.createdAt,
            )
        }
        return ResponseEntity.ok(AuditPageResponse(content, resultPage.totalPages, resultPage.totalElements, resultPage.number, resultPage.size))
    }
}
