package com.mysite.clover.Enrollment;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InstructorEnrollmentDto {
    
    private EnrollmentStatus status; // 수강 상태 (수강중/취소됨)
}