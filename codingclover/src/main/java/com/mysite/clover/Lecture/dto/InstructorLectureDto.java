package com.mysite.clover.Lecture.dto;

import java.time.LocalDateTime;

import com.mysite.clover.Lecture.Lecture;
import com.mysite.clover.Lecture.LectureApprovalStatus;
import com.mysite.clover.Lecture.LectureUploadType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorLectureDto {

    private Long lectureId;
    private Long courseId;      // 강좌 ID (형제 강의 찾기용)
    private String title;
    private Integer orderNo;
    private String videoUrl;
    private Integer duration;
    private LectureUploadType uploadType;
    private LocalDateTime scheduledAt;
    private LectureApprovalStatus approvalStatus;
    private String rejectReason;

    // 엔티티 -> DTO 변환 메서드 (여기서 에러가 많이 납니다!)
    public static InstructorLectureDto fromEntity(Lecture lecture) {
        return InstructorLectureDto.builder()
                .lectureId(lecture.getLectureId())
                // lecture.getCourse()가 null이면 에러가 나므로 안전하게 처리
                .courseId(lecture.getCourse() != null ? lecture.getCourse().getCourseId() : null)
                .title(lecture.getTitle())
                .orderNo(lecture.getOrderNo())
                .videoUrl(lecture.getVideoUrl())
                .duration(lecture.getDuration())
                .uploadType(lecture.getUploadType())
                .scheduledAt(lecture.getScheduledAt())
                .approvalStatus(lecture.getApprovalStatus())
                .rejectReason(lecture.getRejectReason())
                .build();
    }
}