package com.gymsynk.membership

import com.gymsynk.common.email.EmailService
import com.gymsynk.member.repository.UserRepository
import com.gymsynk.membership.repository.MembershipRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

@Component
class MembershipExpiryScheduler(
    private val membershipRepository: MembershipRepository,
    private val userRepository: UserRepository,
    private val emailService: EmailService,
) {
    private val log = LoggerFactory.getLogger(MembershipExpiryScheduler::class.java)
    private val dateFormatter = DateTimeFormatter.ofPattern("d MMM yyyy")

    // ── Expire overdue memberships — runs every hour ─────────────────────────

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    fun expireOverdue() {
        val today = LocalDate.now(ZoneOffset.UTC)
        val expiring = membershipRepository.findExpiredCandidates("ACTIVE", today)
        if (expiring.isEmpty()) return

        expiring.forEach { it.status = "EXPIRED" }
        membershipRepository.saveAll(expiring)
        log.info("Expired {} memberships", expiring.size)
    }

    // ── Send 5-day expiry warnings — runs daily at 08:00 UTC ─────────────────

    @Scheduled(cron = "0 0 8 * * *")
    fun sendExpiryWarnings() {
        val warningDate = LocalDate.now(ZoneOffset.UTC).plusDays(5)
        val memberships = membershipRepository.findExpiringOn("ACTIVE", warningDate)
        if (memberships.isEmpty()) return

        memberships.forEach { membership ->
            userRepository.findById(membership.userId).ifPresent { user ->
                val email = user.email ?: return@ifPresent
                emailService.sendExpiryWarning(
                    toEmail    = email,
                    memberName = "${user.firstName} ${user.lastName}",
                    planName   = membership.plan.name,
                    expiryDate = membership.endDate.format(dateFormatter),
                )
            }
        }
        log.info("Sent expiry warnings for {} memberships expiring on {}", memberships.size, warningDate)
    }
}
