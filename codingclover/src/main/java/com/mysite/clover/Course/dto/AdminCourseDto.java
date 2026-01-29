package com.mysite.clover.Course.dto;

import java.time.LocalDateTime;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseProposalStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 관리자 페이지에서 강좌 정보를 조회할 때 사용하는 데이터 전송 객체 (DTO)
// (Course 엔티티의 모든 주요 정보를 포함하여 관리자가 상세히 볼 수 있도록 함)
@Getter
@AllArgsConstructor
public class AdminCourseDto {
    private Long courseId; // 강좌 ID

    // 강좌 기본 정보
    private String title; // 강좌 제목
    private String description; // 강좌 설명
    private Integer level; // 난이도
    private Integer price; // 수강료
    private String thumbnailUrl; // 썸네일 이미지 주소

    // 승인 관련 정보
    private CourseProposalStatus proposalStatus; // 승인 상태 (PENDING, APPROVED, REJECTED)
    private String proposalRejectReason; // 반려 사유 (반려된 경우)

    // 이력 정보
    private String instructorName; // 강사 이름
    private String approvedByName; // 승인한 관리자 이름 (승인된 경우)
    private LocalDateTime approvedAt; // 승인 일시
    private LocalDateTime createdAt; // 생성 일시
    private LocalDateTime updatedAt; // 수정 일시
    

    // Course 엔티티를 AdminCourseDto로 변환하는 정적 팩토리 메서드
    public static AdminCourseDto fromEntity(Course course) {
        return new AdminCourseDto(
                course.getCourseId(),
                course.getTitle(),
                course.getDescription(),
                course.getLevel(),
                course.getPrice(),
                course.getThumbnailUrl(),
                course.getProposalStatus(),
                course.getProposalRejectReason(),
                // 강사 정보가 존재하면 이름을, 아니면 "Unknown" 반환 (NPE 방지)
                course.getCreatedBy() != null ? course.getCreatedBy().getName() : "Unknown",
                // 승인한 관리자가 있으면 이름을 반환
                course.getApprovedBy() != null ? course.getApprovedBy().getName() : null,
                course.getApprovedAt(),
                course.getCreatedAt(),
                course.getUpdatedAt());
    }
}
