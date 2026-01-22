package com.mysite.clover.Lecture.dto;

import java.time.LocalDateTime;

import com.mysite.clover.Lecture.Lecture;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 강사용 강의 정보 DTO
 * 강사가 관리하는 강의의 상세 정보를 담습니다. (승인 상태 포함)
 */
@Getter
@AllArgsConstructor
public class InstructorLectureDto {
    private Long lectureId;
    private Long courseId;
    private String title;
    private Integer orderNo;
    private String videoUrl;
    private Integer duration;
    private String approvalStatus;
    private String rejectReason;
    private LocalDateTime approvedAt;

    /**
     * Entity -> DTO 변환 메서드
     * 
     * @param lecture 강의 Entity
     * @return InstructorLectureDto
     */
    public static InstructorLectureDto fromEntity(Lecture lecture) {
        return new InstructorLectureDto(
                lecture.getLectureId(),
                lecture.getCourse().getCourseId(),
                lecture.getTitle(),
                lecture.getOrderNo(),
                lecture.getVideoUrl(),
                lecture.getDuration(),
                lecture.getApprovalStatus(),
                lecture.getRejectReason(),
                lecture.getApprovedAt());
    }
}
