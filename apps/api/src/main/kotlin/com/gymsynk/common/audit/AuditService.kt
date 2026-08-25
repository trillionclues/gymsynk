package com.gymsynk.common.audit

import com.gymsynk.member.repository.UserRepository
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AuditService(
    private val auditLogRepository: AuditLogRepository,
    private val userRepository: UserRepository,
) {
    @Async
    fun log(
        orgId: UUID,
        actorId: UUID?,
        action: String,
        entityType: String,
        entityId: UUID? = null,
        oldValue: String? = null,
        newValue: String? = null,
        ipAddress: String? = null,
    ) {
        auditLogRepository.save(
            AuditLog(
                orgId = orgId,
                actorId = actorId,
                action = action,
                entityType = entityType,
                entityId = entityId,
                oldValue = oldValue,
                newValue = newValue,
                ipAddress = ipAddress,
            )
        )
    }
}
