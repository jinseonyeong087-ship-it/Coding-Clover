package com.mysite.clover.Course.dto;

import java.time.LocalDateTime;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseProposalStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 강사용 강좌 정보 DTO
 * 강사가 본인의 강좌를 관리할 때 사용하는 상세 정보를 담습니다. (승인 상태, 반려 사유 등 포함)
 */
@Getter
@AllArgsConstructor
public class InstructorCourseDto {
    private Long courseId;
    private String title;
    private String description;
    private Integer level;
    private Integer price;
    private String thumbnailUrl;
    private CourseProposalStatus proposalStatus;
    private String proposalRejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Entity -> DTO 변환 메서드
     * 
     * @param course 강좌 Entity
     * @return InstructorCourseDto
     */
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
