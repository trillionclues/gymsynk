package com.gymsynk.payment.repository

import com.gymsynk.payment.entity.Payment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface PaymentRepository : JpaRepository<Payment, UUID>
