package com.mysite.clover.Course.dto;

import com.mysite.clover.Course.Course;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 일반 사용자 및 수강생에게 보여주는 강좌 정보 DTO (목록 조회 및 상세 조회용)
@Getter
@AllArgsConstructor
public class StudentCourseDto {
    private Long courseId; // 강좌 ID

    // 강좌 기본 정보
    private String title; // 강좌 제목
    private String description; // 강좌 설명
    private Integer level; // 난이도
    private Integer price; // 수강료
    private String thumbnailUrl; // 썸네일 이미지

    // 강사 정보
    private String instructorName; // 강사 이름 (화면에 표시할 때 필요)

    // Course 엔티티를 StudentCourseDto로 변환하는 정적 팩토리 메서드
    public static StudentCourseDto fromEntity(Course course) {
        return new StudentCourseDto(
                course.getCourseId(),
                course.getTitle(),
                course.getDescription(),
                course.getLevel(),
                course.getPrice(),
                course.getThumbnailUrl(),
                // 강사 정보가 있으면 이름을, 없으면 "Unknown" 반환 (삭제된 사용자 등 예외 처리)
                course.getCreatedBy() != null ? course.getCreatedBy().getName() : "Unknown");
    }
}
