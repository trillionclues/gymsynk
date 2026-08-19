package com.gymsynk.location.repository

import com.gymsynk.location.entity.Location
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface LocationRepository : JpaRepository<Location, UUID> {
    fun findByOrgId(orgId: UUID): List<Location>
}
