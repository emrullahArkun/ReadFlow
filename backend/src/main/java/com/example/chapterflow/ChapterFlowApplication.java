package com.example.chapterflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class ChapterFlowApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChapterFlowApplication.class, args);
	}

}
