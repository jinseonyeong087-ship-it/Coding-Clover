package com.mysite.clover.LectureProgress;

import java.time.LocalDateTime;

import com.mysite.clover.Enrollment.EnrollmentStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminLectureProgressDto {
    
  private Long progressId;

    // 강좌 / 강의
    private Long courseId;
    private String courseTitle;
    private Long lectureId;
    private String lectureTitle;

    // 수강생
    private Long studentId;
    private String studentName;

    // 진도 상태
    private Boolean completedYn;
    private LocalDateTime lastWatchedAt;
    private EnrollmentStatus enrollmentStatus;
}