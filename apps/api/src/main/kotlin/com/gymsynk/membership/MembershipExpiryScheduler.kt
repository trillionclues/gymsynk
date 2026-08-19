package com.gymsynk.membership

import com.gymsynk.membership.repository.MembershipRepository
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.ZoneOffset

@Component
class MembershipExpiryScheduler(
    private val membershipRepository: MembershipRepository,
) {
    @Scheduled(cron = "0 0 * * * *")   // top of every hour
    @Transactional
    fun expireOverdue() {
        val today = LocalDate.now(ZoneOffset.UTC)
        val expiring = membershipRepository.findAllByStatusAndEndDateBefore("ACTIVE", today)
        expiring.forEach { it.status = "EXPIRED" }
        membershipRepository.saveAll(expiring)
    }
}