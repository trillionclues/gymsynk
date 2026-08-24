package com.gymsynk.checkin.repository

import com.gymsynk.checkin.entity.CheckIn
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Repository
interface CheckInRepository : JpaRepository<CheckIn, UUID> {

    @Query("""
        SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END
        FROM CheckIn c
        WHERE c.userId = :userId
          AND c.locationId = :locationId
          AND c.sessionType = :sessionType
          AND CAST(c.checkInTime AS LocalDate) = :date
    """)
    fun existsByUserIdAndLocationIdAndSessionTypeAndDate(
        userId: UUID,
        locationId: UUID,
        sessionType: String,
        date: LocalDate,
    ): Boolean

    @Query("""
        SELECT c FROM CheckIn c
        WHERE c.orgId = :orgId
          AND c.checkInTime BETWEEN :start AND :end
        ORDER BY c.checkInTime DESC
    """)
    fun findByOrgIdAndCheckInTimeBetweenOrderByCheckInTimeDesc(
        orgId: UUID,
        start: Instant,
        end: Instant,
    ): List<CheckIn>

    fun findByUserIdOrderByCheckInTimeDesc(
        userId: UUID,
        pageable: org.springframework.data.domain.Pageable,
    ): org.springframework.data.domain.Page<CheckIn>

    @Query("""
        SELECT COUNT(c) FROM CheckIn c
        WHERE c.orgId = :orgId
          AND c.checkInTime BETWEEN :start AND :end
    """)
    fun countByOrgIdAndCheckInTimeBetween(
        orgId: UUID,
        start: Instant,
        end: Instant,
    ): Long
}
