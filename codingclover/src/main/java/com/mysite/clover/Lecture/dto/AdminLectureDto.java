package com.mysite.clover.Lecture.dto;

import java.time.LocalDateTime;

import com.mysite.clover.Lecture.Lecture;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 관리자가 시스템 내 모든 강의 정보를 조회할 때 사용하는 DTO
@Getter
@AllArgsConstructor
public class AdminLectureDto {
    // 강의 ID
    private Long lectureId;

    // 강의가 속한 강좌의 정보
    private Long courseId; // 강좌 ID
    private String courseTitle; // 강좌 제목

    // 강의 기본 정보
    private String title; // 강의 제목
    private Integer orderNo; // 강의 순서
    private String videoUrl; // 영상 URL
    private Integer duration; // 재생 시간 (초)

    // 관리 정보 (승인 상태 및 이력)
    private String approvalStatus; // 승인 상태 (PENDING, APPROVED...)
    private String rejectReason; // 반려 사유

    // 관련 사용자 정보
    private String createdByName; // 강사 이름
    private String approvedByName; // 승인한 관리자 이름
    private LocalDateTime approvedAt; // 승인 일시
    private LocalDateTime scheduledAt; // 예약 공개 일시 (추가)

    // Lecture 엔티티 -> AdminLectureDto 변환 메서드
    public static AdminLectureDto fromEntity(Lecture lecture) {
        return new AdminLectureDto(
                lecture.getLectureId(),
                lecture.getCourse().getCourseId(),
                lecture.getCourse().getTitle(),
                lecture.getTitle(),
                lecture.getOrderNo(),
                lecture.getVideoUrl(),
                lecture.getDuration(),
                lecture.getApprovalStatus().name(),
                lecture.getRejectReason(),
                lecture.getCreatedBy() != null ? lecture.getCreatedBy().getName() : "Unknown",
                lecture.getApprovedBy() != null ? lecture.getApprovedBy().getName() : null,
                lecture.getApprovedAt(),
                lecture.getScheduledAt());
    }
}
