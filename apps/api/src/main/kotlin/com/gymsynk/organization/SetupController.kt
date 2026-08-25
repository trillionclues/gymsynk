package com.gymsynk.organization

import com.gymsynk.auth.dto.TokenResponse
import com.gymsynk.organization.dto.SetupRequest
import com.gymsynk.organization.dto.SetupStatusResponse
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/setup")
class SetupController(
    private val setupService: SetupService,
) {
    @GetMapping("/status")
    fun status(): ResponseEntity<SetupStatusResponse> =
        ResponseEntity.ok(setupService.isSetupComplete())

    @PostMapping
    fun setup(
        @Valid @RequestBody request: SetupRequest,
        servletRequest: jakarta.servlet.http.HttpServletRequest,
        response: HttpServletResponse,
    ): ResponseEntity<TokenResponse> =
        ResponseEntity.ok(setupService.executeSetup(request, servletRequest, response))
}
