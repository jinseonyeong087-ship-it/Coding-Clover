package com.mysite.clover.Enrollment;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CancelRequestDto {
    private Long enrollmentId;
    private Long requestId; // 프론트엔드 호환용 (enrollmentId와 같은 값)
    private Long id; // 프론트엔드 호환용 (enrollmentId와 같은 값)
    private Long courseId;
    private String courseTitle;
    private String studentName;
    private String studentEmail;
    private LocalDateTime enrollmentDate;
    private LocalDateTime cancelRequestDate;
    private LocalDateTime requestedAt; // 프론트엔드 호환용 (cancelRequestDate와 같은 값)
    private LocalDateTime createdAt; // 프론트엔드 호환용 (cancelRequestDate와 같은 값)
    private Double progress;
    private Double currentProgress; // 프론트엔드 호환용 (progress와 같은 값)
    private Double progressRate; // 프론트엔드 호환용 (progress와 같은 값)
    private Integer completedLectures;
    private Integer totalLectures;
    private Long points;
    private String reason;

    private EnrollmentStatus status;
}