package com.mysite.clover.Lecture.dto;

import java.time.LocalDateTime;

import com.mysite.clover.Lecture.Lecture;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 강사용 강의 정보 DTO
 * 강사가 본인이 업로드한 강의를 관리하기 위한 상세 정보를 담습니다.
 * 강의의 승인 상태, 반려 사유, 비디오 URL 등을 포함하여 강좌 관리 대시보드에서 활용됩니다.
 */
@Getter
@AllArgsConstructor
public class InstructorLectureDto {
    // 강의 ID
    private Long lectureId;
    // 강의가 속한 강좌 ID
    private Long courseId;
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
    // 강의 승인 시간
    private LocalDateTime approvedAt;

    // Entity -> DTO 변환 메서드
    public static InstructorLectureDto fromEntity(Lecture lecture) {
        //
        return new InstructorLectureDto(
                // 강의 ID
                lecture.getLectureId(),
                // 강좌 ID
                lecture.getCourse().getCourseId(),
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
                // 강의 승인 시간
                lecture.getApprovedAt());
    }
}
