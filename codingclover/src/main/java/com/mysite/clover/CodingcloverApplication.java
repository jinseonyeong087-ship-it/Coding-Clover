package com.mysite.clover;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class CodingcloverApplication {

	// 애플리케이션 시작 시 타임존을 한국 시간으로 고정
	@PostConstruct
	public void started() {
		// [수정] 강사가 예약한 시간과 서버 시간이 어긋나지 않도록 서울 시간으로 설정
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
	}

	public static void main(String[] args) {
		SpringApplication.run(CodingcloverApplication.class, args);
	}

}
