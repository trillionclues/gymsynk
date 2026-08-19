package com.gymsynk.auth

import com.gymsynk.auth.dto.*
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/login")
    fun login(@RequestBody @Valid req: LoginRequest) =
        ResponseEntity.ok(authService.staffLogin(req))

    @PostMapping("/refresh")
    fun refresh(request: HttpServletRequest) =
        ResponseEntity.ok(authService.refresh(request))

    @PostMapping("/logout")
    fun logout(request: HttpServletRequest): ResponseEntity<Void> {
        authService.logout(request)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/otp/request")
    fun requestOtp(@RequestBody @Valid req: OtpRequest): ResponseEntity<Void> {
        authService.requestOtp(req.identifier)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/otp/verify")
    fun verifyOtp(@RequestBody @Valid req: OtpVerifyRequest) =
        ResponseEntity.ok(authService.verifyOtp(req))
}