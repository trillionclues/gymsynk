package com.gymsynk.config

import com.gymsynk.location.entity.Location
import com.gymsynk.location.entity.OperatingHours
import com.gymsynk.location.repository.LocationRepository
import com.gymsynk.location.repository.OperatingHoursRepository
import com.gymsynk.member.entity.User
import com.gymsynk.member.entity.UserRole
import com.gymsynk.member.repository.UserRepository
import com.gymsynk.membership.entity.Membership
import com.gymsynk.membership.entity.MembershipPlan
import com.gymsynk.membership.repository.MembershipPlanRepository
import com.gymsynk.membership.repository.MembershipRepository
import com.gymsynk.organization.entity.Organization
import com.gymsynk.organization.repository.OrganizationRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.annotation.Profile
import org.springframework.context.event.EventListener
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalTime

@Component
@Profile("dev")
class DataSeeder(
    private val orgRepository: OrganizationRepository,
    private val locationRepository: LocationRepository,
    private val operatingHoursRepository: OperatingHoursRepository,
    private val userRepository: UserRepository,
    private val planRepository: MembershipPlanRepository,
    private val membershipRepository: MembershipRepository,
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

        // 1. Organization
        val org = orgRepository.save(
            Organization(
                name            = "GymSynk Demo",
                slug            = "gymsynk-demo",
                timezone        = "Africa/Lagos",
                defaultCurrency = "NGN",
                setupComplete   = true,
            )
        )

        // 2. Location
        val location = locationRepository.save(
            Location(
                org     = org,
                name    = "Main Branch",
                address = "12 Fitness Road, Lagos",
            )
        )

        // 3. Operating hours — all 7 days, both sessions
        //    Morning: 06:00–14:00  |  Evening: 14:00–23:00
        //    Wide windows so dev testing works at any time of day
        for (day in 0..6) {
            operatingHoursRepository.save(
                OperatingHours(
                    locationId  = location.id,
                    sessionType = "MORNING",
                    dayOfWeek   = day,
                    openTime    = LocalTime.of(6, 0),
                    closeTime   = LocalTime.of(14, 0),
                )
            )
            operatingHoursRepository.save(
                OperatingHours(
                    locationId  = location.id,
                    sessionType = "EVENING",
                    dayOfWeek   = day,
                    openTime    = LocalTime.of(14, 0),
                    closeTime   = LocalTime.of(23, 0),
                )
            )
        }

        // 4. Staff users
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

        // 5. Test member
        val member = userRepository.save(
            User(
                org          = org,
                email        = "member@gymsynk.com",
                firstName    = "Test",
                lastName     = "Member",
                role         = UserRole.MEMBER,
                memberNumber = "GS-00001",
            )
        )

        // 6. Monthly plan — all days, both sessions
        val monthlyPlan = planRepository.save(
            MembershipPlan(
                org              = org,
                name             = "Monthly",
                durationType     = "MONTHLY",
                durationValue    = 1,
                price            = BigDecimal("15000.00"),
                currency         = "NGN",
                allowedSessionsRaw = "MORNING,EVENING",
                allowedDaysRaw   = "0,1,2,3,4,5,6",
                maxCheckInsPerDay = 1,
            )
        )

        // 7. Active membership for the test member (valid for 30 days from today)
        membershipRepository.save(
            Membership(
                userId     = member.id,
                orgId      = org.id,
                locationId = location.id,
                plan       = monthlyPlan,
                startDate  = LocalDate.now(),
                endDate    = LocalDate.now().plusDays(30),
                status     = "ACTIVE",
            )
        )

        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        log.info("DataSeeder complete — GymSynk Demo")
        log.info("  Location ID : ${location.id}")
        log.info("  Org ID      : ${org.id}")
        log.info("  Staff login  → admin@gymsynk.com / password")
        log.info("  Staff login  → cashier@gymsynk.com / password")
        log.info("  Member OTP   → member@gymsynk.com  (active monthly membership)")
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    }
}
