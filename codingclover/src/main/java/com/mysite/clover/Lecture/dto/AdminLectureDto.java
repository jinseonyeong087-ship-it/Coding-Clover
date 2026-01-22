package com.mysite.clover.Lecture.dto;

import java.time.LocalDateTime;

import com.mysite.clover.Lecture.Lecture;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 관리자용 강의 정보 DTO
 * 모든 강의에 대한 포괄적인 정보를 담습니다. (승인/반려 이력, 강사/승인자 정보 등)
 */
@Getter
@AllArgsConstructor
public class AdminLectureDto {
    private Long lectureId;
    private Long courseId;
    private String courseTitle;
    private String title;
    private Integer orderNo;
    private String videoUrl;
    private Integer duration;
    private String approvalStatus;
    private String rejectReason;
    private String createdByName;
    private String approvedByName;
    private LocalDateTime approvedAt;

    /**
     * Entity -> DTO 변환 메서드
     * 
     * @param lecture 강의 Entity
     * @return AdminLectureDto
     */
    public static AdminLectureDto fromEntity(Lecture lecture) {
        return new AdminLectureDto(
                lecture.getLectureId(),
                lecture.getCourse().getCourseId(),
                lecture.getCourse().getTitle(),
                lecture.getTitle(),
                lecture.getOrderNo(),
                lecture.getVideoUrl(),
                lecture.getDuration(),
                lecture.getApprovalStatus(),
                lecture.getRejectReason(),
                lecture.getCreatedBy() != null ? lecture.getCreatedBy().getName() : "Unknown",
                lecture.getApprovedBy() != null ? lecture.getApprovedBy().getName() : null,
                lecture.getApprovedAt());
    }
}
