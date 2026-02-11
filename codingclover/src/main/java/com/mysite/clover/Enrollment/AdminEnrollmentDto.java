package com.mysite.clover.Enrollment;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminEnrollmentDto {
    
    private Long enrollmentId; // 수강 신청 ID
    
    // 수강생 정보
    private Long userId; // 수강생 ID
    private String userName; // 수강생 이름
    
    // 강좌 정보
    private Long courseId; // 강좌 ID
    private String courseTitle; // 강좌 제목
    
    // 수강 정보
    private LocalDateTime enrolledAt; // 수강 신청 일시
    private EnrollmentStatus status; // 수강 상태 (수강중/취소됨)
    private Long cancelledBy; // 수강 취소한 사용자 ID (취소된 경우)
    
    // 진도율 정보
    private Integer completedLectures; // 완료된 강의 수
    private Integer totalLectures; // 전체 강의 수
    private Double progressRate; // 진도율 (퍼센트)
}