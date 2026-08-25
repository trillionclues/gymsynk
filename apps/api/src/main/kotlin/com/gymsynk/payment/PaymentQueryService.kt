package com.gymsynk.payment

import com.gymsynk.member.repository.UserRepository
import com.gymsynk.payment.dto.PaymentPageResponse
import com.gymsynk.payment.dto.PaymentResponse
import com.gymsynk.payment.repository.PaymentRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class PaymentQueryService(
    private val paymentRepository: PaymentRepository,
    private val userRepository: UserRepository,
) {
    @Transactional(readOnly = true)
    fun listPayments(orgId: UUID, page: Int, size: Int, status: String?): PaymentPageResponse {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        val payments = if (status != null && status.isNotBlank() && status != "ALL") {
            paymentRepository.findByOrgIdAndPaymentStatus(orgId, status, pageable)
        } else {
            paymentRepository.findByOrgId(orgId, pageable)
        }

        val userCache = mutableMapOf<UUID, String>()
        val content = payments.content.map { p ->
            val memberName = userCache.getOrPut(p.userId) {
                userRepository.findById(p.userId).map { u ->
                    listOfNotNull(u.firstName, u.lastName).joinToString(" ").ifBlank { u.email ?: "Unknown" }
                }.orElse("Unknown")
            }
            PaymentResponse(
                id = p.id,
                memberName = memberName,
                amount = p.amount,
                currency = p.currency,
                paymentMethod = p.paymentMethod,
                paymentStatus = p.paymentStatus,
                externalRef = p.externalRef,
                createdAt = p.createdAt,
            )
        }

        return PaymentPageResponse(
            content = content,
            totalPages = payments.totalPages,
            totalElements = payments.totalElements,
            page = payments.number,
            size = payments.size,
        )
    }
}
