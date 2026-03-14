package com.mysite.clover.Enrollment;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudentEnrollmentDto {

    private Long enrollmentId; // 수강 신청 ID
    private Long courseId; // 강좌 ID
    private String courseTitle; // 강좌 제목
    private String thumbnail; // 썸네일 경로
    private LocalDateTime enrolledAt; // 수강 신청 일시
    private EnrollmentStatus status; // 수강 상태 (수강중/취소됨)
}