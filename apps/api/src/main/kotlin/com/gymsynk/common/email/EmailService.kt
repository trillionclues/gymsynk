package com.gymsynk.common.email

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service

@Service
class EmailService(
    private val mailSender: JavaMailSender,
    @Value("\${app.mail.from}") private val fromAddress: String,
) {
    private val log = LoggerFactory.getLogger(EmailService::class.java)
    @Async
    fun sendOtp(toEmail: String, code: String, ttlMinutes: Long = 5) {
        runCatching {
            val message = mailSender.createMimeMessage()
            MimeMessageHelper(message, true, "UTF-8").apply {
                setFrom(fromAddress)
                setTo(toEmail)
                setSubject("Your GymSynk login code")
                setText(otpEmailHtml(code, ttlMinutes), true)  // true = isHtml
            }
            mailSender.send(message)
            log.debug("OTP email sent to {}", toEmail)
        }.onFailure { ex ->
            // Never crash the request if email fails — log and continue
            log.error("Failed to send OTP email to {}: {}", toEmail, ex.message)
        }
    }

    @Async
    fun sendExpiryWarning(toEmail: String, memberName: String, planName: String, expiryDate: String) {
        runCatching {
            val message = mailSender.createMimeMessage()
            MimeMessageHelper(message, true, "UTF-8").apply {
                setFrom(fromAddress)
                setTo(toEmail)
                setSubject("Your GymSynk membership expires soon")
                setText(expiryWarningHtml(memberName, planName, expiryDate), true)
            }
            mailSender.send(message)
            log.debug("Expiry warning sent to {}", toEmail)
        }.onFailure { ex ->
            log.error("Failed to send expiry warning to {}: {}", toEmail, ex.message)
        }
    }
}

// ── Email templates ────────────────────────────────────────────────────────────

private fun otpEmailHtml(code: String, ttlMinutes: Long) = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your login code</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:8px;border:1px solid #e4e4e7;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f4f4f5;">
              <p style="margin:0;font-size:18px;font-weight:600;color:#09090b;letter-spacing:-0.3px;">GymSynk</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:15px;color:#18181b;line-height:1.6;">
                Your one-time login code is:
              </p>

              <!-- Code block -->
              <div style="background:#f4f4f5;border-radius:6px;padding:20px;text-align:center;margin:0 0 24px;">
                <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#09090b;font-family:ui-monospace,monospace;">
                  $code
                </span>
              </div>

              <p style="margin:0 0 8px;font-size:14px;color:#52525b;line-height:1.6;">
                This code expires in <strong>${ttlMinutes} minutes</strong>.
                Do not share it with anyone.
              </p>
              <p style="margin:0;font-size:14px;color:#52525b;line-height:1.6;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f4f4f5;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                GymSynk · Self-hosted gym management
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
""".trimIndent()

private fun expiryWarningHtml(memberName: String, planName: String, expiryDate: String) = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Membership expiring soon</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:8px;border:1px solid #e4e4e7;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f4f4f5;">
              <p style="margin:0;font-size:18px;font-weight:600;color:#09090b;letter-spacing:-0.3px;">GymSynk</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:15px;color:#18181b;line-height:1.6;">
                Hi <strong>$memberName</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#18181b;line-height:1.6;">
                Your <strong>$planName</strong> membership expires on
                <strong>$expiryDate</strong> — that's in 5 days.
              </p>
              <p style="margin:0;font-size:14px;color:#52525b;line-height:1.6;">
                Visit the gym or speak to a cashier to renew before it expires
                so you don't lose access.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f4f4f5;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                GymSynk · Self-hosted gym management
                
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
""".trimIndent()
