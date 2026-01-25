package com.mysite.clover.Lecture.dto;

import java.time.LocalDateTime;

import com.mysite.clover.Lecture.Lecture;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 강사 본인이 업로드한 강의 정보를 조회할 때 사용하는 DTO
@Getter
@AllArgsConstructor
public class InstructorLectureDto {
    // 강의 ID
    private Long lectureId;

    // 강좌 및 기본 정보
    private Long courseId; // 소속 강좌 ID
    private String title; // 강의 제목
    private Integer orderNo; // 강의 순서 (1강, 2강...)
    private String videoUrl; // 영상 파일 경로/URL
    private Integer duration; // 재생 시간 (초 단위)

    // 승인 상태 (업로드 후 관리자 승인이 필요함)
    private String approvalStatus; // 승인 상태 (PENDING/APPROVED/REJECTED)
    private String rejectReason; // 반려된 경우 사유
    private LocalDateTime approvedAt; // 승인된 경우 승인 날짜

    // Lecture -> DTO 변환
    public static InstructorLectureDto fromEntity(Lecture lecture) {
        return new InstructorLectureDto(
                lecture.getLectureId(),
                lecture.getCourse().getCourseId(),
                lecture.getTitle(),
                lecture.getOrderNo(),
                lecture.getVideoUrl(),
                lecture.getDuration(),
                lecture.getApprovalStatus().name(),
                lecture.getRejectReason(),
                lecture.getApprovedAt());
    }
}
