package com.gymsynk.checkin.websocket

import org.springframework.data.redis.connection.Message
import org.springframework.data.redis.connection.MessageListener
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class CheckInWebSocketHandler(
    private val messagingTemplate: SimpMessagingTemplate,
) : MessageListener {

    // Called by RedisMessageListenerContainer whenever a check-in is published
    override fun onMessage(message: Message, pattern: ByteArray?) {
        val orgId   = String(message.channel).removePrefix("checkin:")
        val payload = String(message.body)
        // Pushes to all connected cashier dashboards subscribed to this org
        messagingTemplate.convertAndSend("/topic/checkins/$orgId", payload)
    }
}