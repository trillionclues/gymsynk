package com.gymsynk.analytics.dto

data class DailyPoint(val date: String, val count: Long)
data class RevenuePoint(val date: String, val amount: Double)
data class HeatmapCell(val day: Int, val hour: Int, val count: Long)

data class AttendanceSeriesResponse(val series: List<DailyPoint>)
data class RevenueSeriesResponse(val series: List<RevenuePoint>)
data class HeatmapResponse(val cells: List<HeatmapCell>)
