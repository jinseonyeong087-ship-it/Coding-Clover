package com.mysite.clover.Enrollment;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InstructorEnrollmentDto {
    
    private Long enrollmentId;
    private Long userId;
    private String userName;
    private LocalDateTime enrolledAt;
    private EnrollmentStatus status;
}