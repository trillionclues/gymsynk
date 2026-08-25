package com.gymsynk.common.exception

class BusinessException(
    val code: String,
    message: String,
    val httpStatus: Int = 400,
) : RuntimeException(message)

object ErrorCodes {
    const val TOKEN_INVALID      = "TOKEN_INVALID"
    const val TOKEN_EXPIRED      = "TOKEN_EXPIRED"
    const val MEMBER_NOT_FOUND   = "MEMBER_NOT_FOUND"
    const val MEMBERSHIP_EXPIRED = "EXPIRED_PLAN"
    const val WRONG_SESSION      = "WRONG_SESSION"
    const val WRONG_DAY          = "WRONG_DAY"
    const val ALREADY_CHECKED_IN = "ALREADY_CHECKED_IN"
    const val UNAUTHORIZED       = "UNAUTHORIZED"
    const val CONFLICT           = "CONFLICT"
}