package com.gymsynk.location.repository

import com.gymsynk.location.entity.OperatingHours
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface OperatingHoursRepository : JpaRepository<OperatingHours, UUID> {
    fun findByLocationId(locationId: UUID): List<OperatingHours>
}
