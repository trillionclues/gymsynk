package com.gymsynk.location.dto

import java.util.UUID

data class LocationResponse(
    val id: UUID,
    val name: String,
    val address: String?,
    val isActive: Boolean,
)
