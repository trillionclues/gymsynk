package com.gymsynk.payment.repository

import com.gymsynk.payment.entity.Payment
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

@Repository
interface PaymentRepository : JpaRepository<Payment, UUID> {
    @Query("""
        SELECT COALESCE(SUM(p.amount), 0) FROM Payment p
        WHERE p.orgId = :orgId
          AND p.paymentStatus = 'COMPLETED'
          AND p.createdAt BETWEEN :start AND :end
    """)
    fun sumCompletedRevenueBetween(
        orgId: UUID,
        start: Instant,
        end: Instant,
    ): BigDecimal

    fun findByOrgId(orgId: UUID, pageable: Pageable): Page<Payment>

    fun findByOrgIdAndPaymentStatus(orgId: UUID, paymentStatus: String, pageable: Pageable): Page<Payment>
}

