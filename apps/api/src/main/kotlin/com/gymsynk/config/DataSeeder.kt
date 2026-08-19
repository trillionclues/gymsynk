package com.gymsynk.config

import com.gymsynk.member.entity.User
import com.gymsynk.member.entity.UserRole
import com.gymsynk.member.repository.UserRepository
import com.gymsynk.organization.entity.Organization
import com.gymsynk.organization.repository.OrganizationRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.annotation.Profile
import org.springframework.context.event.EventListener
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Profile("dev")
class DataSeeder(
    private val orgRepository: OrganizationRepository,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
) {
    private val log = LoggerFactory.getLogger(DataSeeder::class.java)

    @EventListener(ApplicationReadyEvent::class)
    @Transactional
    fun seed() {
        if (orgRepository.count() > 0) {
            log.info("DataSeeder: data already present, skipping")
            return
        }

        val org = orgRepository.save(
            Organization(
                name          = "GymSynk Demo",
                slug          = "gymsynk-demo",
                timezone      = "Africa/Lagos",
                defaultCurrency = "NGN",
                setupComplete = true,
            )
        )

        userRepository.save(
            User(
                org          = org,
                email        = "admin@gymsynk.com",
                firstName    = "Admin",
                lastName     = "User",
                role         = UserRole.ADMIN,
                passwordHash = passwordEncoder.encode("password"),
            )
        )

        userRepository.save(
            User(
                org          = org,
                email        = "cashier@gymsynk.com",
                firstName    = "Cashier",
                lastName     = "User",
                role         = UserRole.CASHIER,
                passwordHash = passwordEncoder.encode("password"),
            )
        )

        userRepository.save(
            User(
                org          = org,
                email        = "member@gymsynk.com",
                firstName    = "Test",
                lastName     = "Member",
                role         = UserRole.MEMBER,
                memberNumber = "GS-00001",
            )
        )

        log.info("DataSeeder: seeded org '${org.name}' with admin, cashier, and 1 test member")
        log.info("  admin@gymsynk.com   / password  (ADMIN)")
        log.info("  cashier@gymsynk.com / password  (CASHIER)")
        log.info("  member@gymsynk.com              (MEMBER — use OTP login)")
    }
}
