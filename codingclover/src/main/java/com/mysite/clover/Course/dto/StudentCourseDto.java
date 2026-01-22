package com.mysite.clover.Course.dto;

import com.mysite.clover.Course.Course;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 수강생용 강좌 정보 DTO
 * 수강생에게 공개되는 강좌의 기본 정보를 담습니다.
 */
@Getter
@AllArgsConstructor
public class StudentCourseDto {
    private Long courseId;
    private String title;
    private String description;
    private Integer level;
    private Integer price;
    private String thumbnailUrl;
    private String instructorName;

    /**
     * Entity -> DTO 변환 메서드
     * 
     * @param course 강좌 Entity
     * @return StudentCourseDto
     */
    public static StudentCourseDto fromEntity(Course course) {
        return new StudentCourseDto(
                course.getCourseId(),
                course.getTitle(),
                course.getDescription(),
                course.getLevel(),
                course.getPrice(),
                course.getThumbnailUrl(),
                course.getCreatedBy() != null ? course.getCreatedBy().getName() : "Unknown");
    }
}
