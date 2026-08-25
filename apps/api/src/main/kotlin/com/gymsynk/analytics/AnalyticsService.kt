package com.gymsynk.analytics

import com.gymsynk.analytics.dto.*
import com.gymsynk.checkin.repository.CheckInRepository
import com.gymsynk.organization.repository.OrganizationRepository
import com.gymsynk.payment.repository.PaymentRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.UUID

@Service
class AnalyticsService(
    private val checkInRepository: CheckInRepository,
    private val paymentRepository: PaymentRepository,
    private val organizationRepository: OrganizationRepository,
) {
    @Transactional(readOnly = true)
    fun attendanceSeries(orgId: UUID, from: LocalDate, to: LocalDate): AttendanceSeriesResponse {
        val zone = resolveZone(orgId)
        val start = from.atStartOfDay(zone).toInstant()
        val end = to.plusDays(1).atStartOfDay(zone).toInstant()
        val checkIns = checkInRepository.findByOrgIdAndCheckInTimeBetweenOrderByCheckInTimeDesc(orgId, start, end)
        val fmt = DateTimeFormatter.ISO_LOCAL_DATE
        val grouped = checkIns.groupBy { fmt.format(it.checkInTime.atZone(zone).toLocalDate()) }
            .mapValues { (_, v) -> v.size.toLong() }
        val series = from.datesUntil(to.plusDays(1)).map { d ->
            DailyPoint(date = fmt.format(d), count = grouped.getOrDefault(fmt.format(d), 0L))
        }.toList()
        return AttendanceSeriesResponse(series)
    }

    @Transactional(readOnly = true)
    fun revenueSeries(orgId: UUID, from: LocalDate, to: LocalDate): RevenueSeriesResponse {
        val zone = resolveZone(orgId)
        val fmt = DateTimeFormatter.ISO_LOCAL_DATE
        val series = from.datesUntil(to.plusDays(1)).map { d ->
            val dayStart = d.atStartOfDay(zone).toInstant()
            val dayEnd = d.plusDays(1).atStartOfDay(zone).toInstant()
            val amount = paymentRepository.sumCompletedRevenueBetween(orgId, dayStart, dayEnd)
            RevenuePoint(date = fmt.format(d), amount = amount.toDouble())
        }.toList()
        return RevenueSeriesResponse(series)
    }

    @Transactional(readOnly = true)
    fun heatmap(orgId: UUID): HeatmapResponse {
        val zone = resolveZone(orgId)
        val start = LocalDate.now(zone).minusDays(89).atStartOfDay(zone).toInstant()
        val end = LocalDate.now(zone).plusDays(1).atStartOfDay(zone).toInstant()
        val checkIns = checkInRepository.findByOrgIdAndCheckInTimeBetweenOrderByCheckInTimeDesc(orgId, start, end)
        val cellMap = mutableMapOf<Pair<Int, Int>, Long>()
        for (ci in checkIns) {
            val zdt = ci.checkInTime.atZone(zone)
            val day = zdt.dayOfWeek.value // 1 = Mon, 7 = Sun
            val hour = zdt.hour
            cellMap[Pair(day, hour)] = (cellMap[Pair(day, hour)] ?: 0L) + 1
        }
        val cells = cellMap.map { (k, v) -> HeatmapCell(day = k.first, hour = k.second, count = v) }
        return HeatmapResponse(cells)
    }

    private fun resolveZone(orgId: UUID): ZoneId =
        organizationRepository.findById(orgId)
            .map { ZoneId.of(it.timezone) }
            .orElse(ZoneOffset.UTC)
}
