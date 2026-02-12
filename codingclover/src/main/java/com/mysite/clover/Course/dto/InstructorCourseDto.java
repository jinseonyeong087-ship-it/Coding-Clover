package com.mysite.clover.Course.dto;

import java.time.LocalDateTime;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseProposalStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 강사용 강좌 정보 DTO
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
