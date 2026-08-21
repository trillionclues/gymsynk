package com.gymsynk.location

import com.gymsynk.location.dto.LocationResponse
import com.gymsynk.location.repository.LocationRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class LocationQueryService(
    private val locationRepository: LocationRepository,
) {
    @Transactional(readOnly = true)
    fun byOrg(orgId: UUID): List<LocationResponse> =
        locationRepository.findByOrgId(orgId)
            .sortedBy { it.name.lowercase() }
            .map {
                LocationResponse(
                    id = it.id,
                    name = it.name,
                    address = it.address,
                    isActive = it.isActive,
                )
            }
}
