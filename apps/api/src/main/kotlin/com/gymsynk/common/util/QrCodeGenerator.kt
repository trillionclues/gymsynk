package com.gymsynk.common.util

import com.google.zxing.BarcodeFormat
import com.google.zxing.client.j2se.MatrixToImageWriter
import com.google.zxing.qrcode.QRCodeWriter
import org.springframework.stereotype.Component
import java.io.ByteArrayOutputStream

@Component
class QrCodeGenerator {
    private val writer = QRCodeWriter()

    fun generate(content: String, size: Int = 280): ByteArray {
        val matrix = writer.encode(content, BarcodeFormat.QR_CODE, size, size)
        val out = ByteArrayOutputStream()
        MatrixToImageWriter.writeToStream(matrix, "PNG", out)
        return out.toByteArray()
    }
}