package com.gymsynk.organization

import com.gymsynk.auth.JwtService
import com.gymsynk.auth.dto.TokenResponse
import com.gymsynk.common.exception.BusinessException
import com.gymsynk.common.exception.ErrorCodes
import com.gymsynk.location.entity.Location
import com.gymsynk.location.entity.OperatingHours
import com.gymsynk.location.repository.LocationRepository
import com.gymsynk.location.repository.OperatingHoursRepository
import com.gymsynk.member.entity.User
import com.gymsynk.member.entity.UserRole
import com.gymsynk.member.repository.UserRepository
import com.gymsynk.membership.entity.MembershipPlan
import com.gymsynk.membership.repository.MembershipPlanRepository
import com.gymsynk.organization.dto.SetupRequest
import com.gymsynk.organization.dto.SetupStatusResponse
import com.gymsynk.organization.entity.Organization
import com.gymsynk.organization.repository.OrganizationRepository
import jakarta.servlet.http.HttpServletResponse
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.LocalTime
import java.util.Locale

@Service
class SetupService(
    private val orgRepository: OrganizationRepository,
    private val locationRepository: LocationRepository,
    private val operatingHoursRepository: OperatingHoursRepository,
    private val planRepository: MembershipPlanRepository,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
    private val redis: StringRedisTemplate,
) {
    private val refreshTtl = Duration.ofDays(30)

    @Transactional(readOnly = true)
    fun isSetupComplete(): SetupStatusResponse {
        val completedCount = orgRepository.findAll().count { it.setupComplete }
        return SetupStatusResponse(setupComplete = completedCount > 0)
    }

    @Transactional
    fun executeSetup(req: SetupRequest, request: jakarta.servlet.http.HttpServletRequest? = null, response: HttpServletResponse): TokenResponse {
        if (isSetupComplete().setupComplete) {
            throw BusinessException(ErrorCodes.CONFLICT, "First-run setup has already been completed", 400)
        }

        val cleanAdminEmail = req.adminEmail.trim().lowercase()
        if (userRepository.findByEmailIgnoreCase(cleanAdminEmail).isPresent) {
            throw BusinessException(ErrorCodes.CONFLICT, "User with email $cleanAdminEmail already exists", 400)
        }

        val slug = req.orgName.lowercase(Locale.ROOT)
            .replace(Regex("[^a-z0-9]+"), "-")
            .trim('-')
            .ifEmpty { "gymsynk-org" }

        // 1. Create Organization
        val organization = orgRepository.save(
            Organization(
                name = req.orgName,
                slug = slug,
                defaultCurrency = req.currency,
                timezone = req.timezone,
                paymentMode = req.paymentMode,
                setupComplete = true,
            )
        )

        // 2. Create Location
        val location = locationRepository.save(
            Location(
                org = organization,
                name = req.locationName,
                address = req.address,
                latitude = req.latitude,
                longitude = req.longitude,
                city = req.city,
                country = req.country,
                placeId = req.placeId,
                geofenceRadiusMeters = req.geofenceRadiusMeters ?: 100,
            )
        )

        // 3. Create Operating Hours
        if (req.operatingHours.isNotEmpty()) {
            val hoursEntities = req.operatingHours.map { h ->
                OperatingHours(
                    locationId = location.id,
                    sessionType = h.sessionType,
                    dayOfWeek = h.dayOfWeek,
                    openTime = LocalTime.parse(h.openTime),
                    closeTime = LocalTime.parse(h.closeTime),
                    isActive = h.isActive,
                )
            }
            operatingHoursRepository.saveAll(hoursEntities)
        }

        // 4. Create Initial Plans
        if (req.plans.isNotEmpty()) {
            val planEntities = req.plans.map { p ->
                MembershipPlan(
                    org = organization,
                    name = p.name,
                    price = p.price,
                    currency = p.currency,
                    durationType = p.durationType,
                    durationValue = p.durationValue,
                    allowedSessionsRaw = p.allowedSessions,
                    allowedDaysRaw = p.allowedDays,
                    maxCheckInsPerDay = p.maxCheckinsPerDay,
                )
            }
            planRepository.saveAll(planEntities)
        }

        // 5. Create Admin User
        val admin = userRepository.save(
            User(
                org = organization,
                email = cleanAdminEmail,
                passwordHash = passwordEncoder.encode(req.adminPassword),
                firstName = req.adminFirstName,
                lastName = req.adminLastName,
                role = UserRole.ADMIN,
            )
        )

        // 6. Issue Tokens and set Cookie
        val accessToken = jwtService.generateAccessToken(admin.id, admin.role.name, organization.id)
        val refreshToken = jwtService.generateRefreshToken()

        redis.opsForValue().set(
            "refresh:$refreshToken",
            "${admin.id}:${admin.role.name}:${organization.id}",
            refreshTtl,
        )

        setRefreshCookie(request, response, refreshToken)
        return TokenResponse(accessToken)
    }

    private fun setRefreshCookie(request: jakarta.servlet.http.HttpServletRequest?, response: HttpServletResponse, token: String) {
        val maxAge = refreshTtl.seconds.toInt()
        val isSecure = request?.isSecure == true || request?.getHeader("X-Forwarded-Proto") == "https"
        val sameSite = if (isSecure) "None" else "Lax"
        val secureFlag = if (isSecure) "; Secure" else ""
        val cookie = "refresh_token=$token; HttpOnly; Path=/; Max-Age=$maxAge; SameSite=$sameSite$secureFlag"
        response.addHeader("Set-Cookie", cookie)
    }
}
