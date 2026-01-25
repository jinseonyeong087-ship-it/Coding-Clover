package com.mysite.clover.Course.dto;

import java.time.LocalDateTime;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseProposalStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 강사 본인이 개설한 강좌 정보를 조회할 때 사용하는 DTO
// (강사에게 필요한 정보만 선별해서 전달)
@Getter
@AllArgsConstructor
public class InstructorCourseDto {
    private Long courseId; // 강좌 ID

    // 강좌 기본 정보
    private String title; // 강좌 제목
    private String description; // 강좌 설명
    private Integer level; // 난이도
    private Integer price; // 수강료
    private String thumbnailUrl; // 썸네일 이미지

    // 승인 상태 (중요: 관리자가 승인했는지 반려했는지 확인 필요)
    private CourseProposalStatus proposalStatus; // 승인 상태
    private String proposalRejectReason; // 반려 사유 (반려된 경우 확인용)

    // 일정 정보
    private LocalDateTime createdAt; // 생성 일시
    private LocalDateTime updatedAt; // 수정 일시

    // Course 엔티티를 InstructorCourseDto로 변환하는 정적 팩토리 메서드
    public static InstructorCourseDto fromEntity(Course course) {
        return new InstructorCourseDto(
                course.getCourseId(),
                course.getTitle(),
                course.getDescription(),
                course.getLevel(),
                course.getPrice(),
                course.getThumbnailUrl(),
                course.getProposalStatus(),
                course.getProposalRejectReason(),
                course.getCreatedAt(),
                course.getUpdatedAt());
    }
}
