package com.gymsynk.member.repository

import com.gymsynk.member.entity.User
import com.gymsynk.member.entity.UserRole
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface UserRepository : JpaRepository<User, UUID> {
    fun findByEmail(email: String): Optional<User>
    fun findByMemberNumber(memberNumber: String): Optional<User>
    fun existsByEmail(email: String): Boolean

    @Query("""
        SELECT u FROM User u
        WHERE u.org.id = :orgId
          AND u.role = 'MEMBER'
          AND (
                :search IS NULL OR :search = '' OR
                lower(concat(coalesce(u.firstName, ''), ' ', coalesce(u.lastName, ''))) LIKE lower(concat('%', :search, '%')) OR
                lower(coalesce(u.email, '')) LIKE lower(concat('%', :search, '%')) OR
                lower(coalesce(u.phone, '')) LIKE lower(concat('%', :search, '%')) OR
                lower(coalesce(u.memberNumber, '')) LIKE lower(concat('%', :search, '%'))
          )
        ORDER BY u.createdAt DESC
    """)
    fun searchMembers(orgId: UUID, search: String?, pageable: org.springframework.data.domain.Pageable): org.springframework.data.domain.Page<User>

    @Query("""
        SELECT COUNT(u) FROM User u
        WHERE u.org.id = :orgId
          AND u.role = 'MEMBER'
          AND u.isActive = true
    """)
    fun countActiveMembers(orgId: UUID): Long

    @Query("""
        SELECT COUNT(u) FROM User u
        WHERE u.org.id = :orgId
          AND u.role = :role
    """)
    fun countByOrgAndRole(orgId: UUID, role: UserRole): Long
}
