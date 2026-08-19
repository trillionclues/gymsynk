package com.gymsynk.organization.repository

import com.gymsynk.organization.entity.Organization
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface OrganizationRepository : JpaRepository<Organization, UUID> {
    fun findBySlug(slug: String): Optional<Organization>
}
