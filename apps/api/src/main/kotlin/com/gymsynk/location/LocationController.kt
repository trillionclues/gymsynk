package com.gymsynk.location

import com.gymsynk.auth.requireAuthContext
import com.gymsynk.location.dto.LocationResponse
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/locations")
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
class LocationController(
    private val locationQueryService: LocationQueryService,
) {
    @GetMapping
    fun listLocations(auth: Authentication): ResponseEntity<List<LocationResponse>> =
        ResponseEntity.ok(locationQueryService.byOrg(auth.requireAuthContext().orgId))
}
