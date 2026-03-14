package com.mysite.clover.Course.dto;

import java.time.LocalDateTime;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseProposalStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 관리자용 강좌 정보 DTO
@Getter
@AllArgsConstructor
public class AdminCourseDto {
    private Long courseId;
    private String title;
    private String description;
    private Integer level;
    private Integer price;
    private String thumbnailUrl;
    private CourseProposalStatus proposalStatus;
    private String proposalRejectReason;
    private String instructorName;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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
                course.getCreatedBy() != null ? course.getCreatedBy().getName() : "Unknown",
                course.getApprovedBy() != null ? course.getApprovedBy().getName() : null,
                course.getApprovedAt(),
                course.getCreatedAt(),
                course.getUpdatedAt());
    }
}
