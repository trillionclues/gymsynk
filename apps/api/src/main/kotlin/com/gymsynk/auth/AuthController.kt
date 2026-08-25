package com.gymsynk.auth

import com.gymsynk.auth.dto.*
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/login")
    fun login(
        @RequestBody @Valid req: LoginRequest,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): ResponseEntity<TokenResponse> =
        ResponseEntity.ok(authService.staffLogin(req, request, response))

    @PostMapping("/refresh")
    fun refresh(
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): ResponseEntity<TokenResponse> =
        ResponseEntity.ok(authService.refresh(request, response))

    @PostMapping("/logout")
    fun logout(
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): ResponseEntity<Void> {
        authService.logout(request, response)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/otp/request")
    fun requestOtp(@RequestBody @Valid req: OtpRequest): ResponseEntity<Void> {
        authService.requestOtp(req.identifier)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/otp/verify")
    fun verifyOtp(
        @RequestBody @Valid req: OtpVerifyRequest,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): ResponseEntity<TokenResponse> =
        ResponseEntity.ok(authService.verifyOtp(req, request, response))
}
