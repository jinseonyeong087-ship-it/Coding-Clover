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
    private LocalDateTime requestedAt; // 프론트엔드 호환용 (cancelRequestDate와 같은 값)
    private LocalDateTime createdAt; // 프론트엔드 호환용 (cancelRequestDate와 같은 값)
    private Double currentProgress; // 프론트엔드 호환용 (progress와 같은 값)
    private Double progressRate; // 프론트엔드 호환용 (progress와 같은 값)

    private EnrollmentStatus status;

    //Enrollment 기반 취소 요청 객체처럼 보이게 만드는 필드를 추가(테이블이 없어서 DTO로 대체)
}