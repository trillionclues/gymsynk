package com.gymsynk.membership.repository

import com.gymsynk.membership.entity.Membership
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.UUID

@Repository
interface MembershipRepository : JpaRepository<Membership, UUID> {

    @Query("""
        SELECT m FROM Membership m
        WHERE m.userId = :userId
          AND m.locationId = :locationId
          AND m.status = 'ACTIVE'
        ORDER BY m.endDate DESC
    """)
    fun findActiveByUserAndLocation(userId: UUID, locationId: UUID): Membership?

    @Query("SELECT m FROM Membership m WHERE m.status = :status AND m.endDate < :date")
    fun findExpiredCandidates(status: String, date: LocalDate): List<Membership>

    @Query("SELECT m FROM Membership m WHERE m.status = :status AND m.endDate = :date")
    fun findExpiringOn(status: String, date: LocalDate): List<Membership>

    @Query("SELECT m FROM Membership m WHERE m.status = :status AND m.endDate = :date")
    fun findAllByStatusAndEndDate(status: String, date: LocalDate): List<Membership>
}
