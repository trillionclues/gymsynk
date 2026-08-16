package com.gymsynk

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class GymSynkApplication

fun main(args: Array<String>) {
	runApplication<GymSynkApplication>(*args)
}
