package com.mysite.clover.Enrollment;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudentEnrollmentDto {
    
    private Long enrollmentId;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime enrolledAt;
    private EnrollmentStatus status;
}