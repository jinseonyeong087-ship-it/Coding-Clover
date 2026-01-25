package com.mysite.clover.Lecture.dto;

import java.time.LocalDateTime;

import com.mysite.clover.Lecture.Lecture;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 관리자용 강의 정보 DTO
 * 모든 강의에 대한 포괄적인 정보(승인/반려 이력, 강사/승인자 정보 등)를 담습니다.
 * 관리자가 시스템 전체의 강의 현황을 모니터링하고 감사(Audit)하기 위해 사용됩니다.
 */
@Getter
@AllArgsConstructor
public class AdminLectureDto {
    // 강의 ID
    private Long lectureId;
    // 강의가 속한 강좌 ID
    private Long courseId;
    // 강의가 속한 강좌 제목
    private String courseTitle;
    // 강의 제목
    private String title;
    // 강의 순서
    private Integer orderNo;
    // 강의 URL
    private String videoUrl;
    // 강의 길이
    private Integer duration;
    // 강의 승인 상태
    private String approvalStatus;
    // 강의 반려 이유
    private String rejectReason;
    // 강의 생성자 이름
    private String createdByName;
    // 강의 승인자 이름
    private String approvedByName;
    // 강의 승인 시간
    private LocalDateTime approvedAt;

    // Entity -> DTO 변환
    public static AdminLectureDto fromEntity(Lecture lecture) {
        return new AdminLectureDto(
                // 강의 ID
                lecture.getLectureId(),
                // 강의가 속한 강좌 ID
                lecture.getCourse().getCourseId(),
                // 강의가 속한 강좌 제목
                lecture.getCourse().getTitle(),
                // 강의 제목
                lecture.getTitle(),
                // 강의 순서
                lecture.getOrderNo(),
                // 강의 URL
                lecture.getVideoUrl(),
                // 강의 길이
                lecture.getDuration(),
                // 강의 승인 상태
                lecture.getApprovalStatus().name(),
                // 강의 반려 이유
                lecture.getRejectReason(),
                // 강의 생성자 이름
                lecture.getCreatedBy() != null ? lecture.getCreatedBy().getName() : "Unknown",
                // 강의 승인자 이름
                lecture.getApprovedBy() != null ? lecture.getApprovedBy().getName() : null,
                // 강의 승인 시간
                lecture.getApprovedAt());
    }
}
