package com.gymsynk.config

import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.annotation.Profile
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

/**
 * Dev-only seed component. Populated once Phase 1 entities are in place.
 * Gated by @Profile("dev") — never runs in production.
 *
 * TODO (Phase 1): inject OrganizationRepository, UserRepository, PasswordEncoder
 *   and seed: 1 org, 1 admin, 1 cashier, 20 members with varied plan states.
 *   Seed credentials: admin@gymsynk.com / password, cashier@gymsynk.com / password
 */
@Component
@Profile("dev")
class DataSeeder {

    @EventListener(ApplicationReadyEvent::class)
    fun seed() {
        // Stub — no-op until Phase 1 entities are built.
        // See Phase 1 §1.7 in GymSynk_Phase0_1_Guide.md for the full implementation.
    }
}
