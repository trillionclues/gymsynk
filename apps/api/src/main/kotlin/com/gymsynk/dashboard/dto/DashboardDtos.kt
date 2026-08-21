package com.gymsynk.dashboard.dto

import java.math.BigDecimal

data class DashboardStatsResponse(
    val todayCheckIns: Long,
    val activeMembers: Long,
    val revenueToday: BigDecimal,
)
