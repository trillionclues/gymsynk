package com.gymsynk.config

import com.gymsynk.checkin.websocket.CheckInWebSocketHandler
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.listener.PatternTopic
import org.springframework.data.redis.listener.RedisMessageListenerContainer

@Configuration
class RedisConfig {

    @Bean
    fun redisListenerContainer(
        factory: RedisConnectionFactory,
        handler: CheckInWebSocketHandler,
    ): RedisMessageListenerContainer = RedisMessageListenerContainer().apply {
        setConnectionFactory(factory)
        addMessageListener(handler, PatternTopic("checkin:*"))
    }
}