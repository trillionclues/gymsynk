package com.gymsynk.member

import com.gymsynk.common.exception.BusinessException
import com.gymsynk.common.exception.ErrorCodes
import com.gymsynk.member.dto.CreateStaffRequest
import com.gymsynk.member.dto.StaffMemberResponse
import com.gymsynk.member.entity.User
import com.gymsynk.member.entity.UserRole
import com.gymsynk.member.repository.UserRepository
import com.gymsynk.organization.repository.OrganizationRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class StaffService(
    private val userRepository: UserRepository,
    private val organizationRepository: OrganizationRepository,
    private val passwordEncoder: PasswordEncoder,
) {
    @Transactional(readOnly = true)
    fun listStaff(orgId: UUID): List<StaffMemberResponse> {
        val staffRoles = listOf(UserRole.ADMIN, UserRole.CASHIER, UserRole.FLOOR_STAFF)
        return userRepository.findAll()
            .filter { it.org.id == orgId && it.role in staffRoles }
            .sortedBy { it.firstName.lowercase() }
            .map { toResponse(it) }
    }

    @Transactional
    fun createStaff(orgId: UUID, req: CreateStaffRequest): StaffMemberResponse {
        val org = organizationRepository.findById(orgId).orElseThrow {
            BusinessException(ErrorCodes.UNAUTHORIZED, "Organization not found", 404)
        }

        if (userRepository.findByEmail(req.email).isPresent) {
            throw BusinessException(ErrorCodes.CONFLICT, "User with email ${req.email} already exists", 400)
        }

        val parsedRole = try {
            UserRole.valueOf(req.role.uppercase())
        } catch (e: Exception) {
            UserRole.CASHIER
        }

        val staffUser = userRepository.save(
            User(
                org = org,
                email = req.email,
                phone = req.phone,
                passwordHash = passwordEncoder.encode(req.password),
                firstName = req.firstName,
                lastName = req.lastName,
                role = parsedRole,
                isActive = true,
            )
        )
        return toResponse(staffUser)
    }

    @Transactional
    fun toggleStaffActive(orgId: UUID, staffId: UUID): StaffMemberResponse {
        val user = userRepository.findById(staffId).orElseThrow {
            BusinessException(ErrorCodes.MEMBER_NOT_FOUND, "Staff member not found", 404)
        }

        if (user.org.id != orgId) {
            throw BusinessException(ErrorCodes.UNAUTHORIZED, "Access denied to staff user", 403)
        }

        user.isActive = !user.isActive
        return toResponse(userRepository.save(user))
    }

    private fun toResponse(user: User) = StaffMemberResponse(
        id = user.id,
        firstName = user.firstName,
        lastName = user.lastName,
        email = user.email,
        phone = user.phone,
        role = user.role.name,
        isActive = user.isActive,
        createdAt = user.createdAt,
    )
}
