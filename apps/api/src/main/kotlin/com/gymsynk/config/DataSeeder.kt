package com.gymsynk.config

import com.gymsynk.member.entity.User
import com.gymsynk.member.entity.UserRole
import com.gymsynk.organization.entity.Organization
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
    @EventListener(ApplicationReadyEvent::class)
    @Transactional
    fun seed() {
        if (orgRepository.count() > 0) return

        val org = orgRepository.save(
            Organization(
                name = "GymSynk Demo",
                slug = "gymsynk-demo",
                timezone = "Africa/Lagos",
                defaultCurrency = "NGN",
                setupComplete = true,
            )
        )

        // Admin user
        userRepository.save(
            User(
                org = org,
                email = "admin@gymsynk.com",
                firstName = "Admin",
                lastName = "User",
                role = UserRole.ADMIN,
                passwordHash = passwordEncoder.encode("password"),
            )
        )

        // Cashier user
        userRepository.save(
            User(
                org = org,
                email = "cashier@gymsynk.com",
                firstName = "Cashier",
                lastName = "User",
                role = UserRole.CASHIER,
                passwordHash = passwordEncoder.encode("password"),
            )
        )

        // 20 members — mix of active, expired, expiring-soon added here
        // (expand as needed; simple for now)
    }
}