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

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner fixPaymentSchema(
			org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				// MySQL ENUM 타입 등으로 인해 'REJECTED' 추가 시 발생하는 Data truncated 오류 해결
				// 컬럼을 충분한 길이의 VARCHAR로 변경하여 모든 ENUM 값 수용
				jdbcTemplate.execute("ALTER TABLE payment MODIFY COLUMN status VARCHAR(50) NOT NULL");
				System.out.println(">>> SchemaFixer: payment.status 컬럼을 VARCHAR(50)으로 변경했습니다.");
			} catch (Exception e) {
				System.out.println(">>> SchemaFixer Warning: " + e.getMessage());
			}
		};
	}

}
