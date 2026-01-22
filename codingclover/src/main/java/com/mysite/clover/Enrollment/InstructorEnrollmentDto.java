package com.mysite.clover.Enrollment;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InstructorEnrollmentDto {
    
    private Long enrollmentId; // 수강 신청 ID
    private Long userId; // 수강생 ID
    private String userName; // 수강생 이름
    private LocalDateTime enrolledAt; // 수강 신청 일시
    private EnrollmentStatus status; // 수강 상태 (수강중/취소됨)
}