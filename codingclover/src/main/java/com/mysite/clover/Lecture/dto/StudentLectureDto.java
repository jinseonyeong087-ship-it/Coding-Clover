package com.mysite.clover.Lecture.dto;

import com.mysite.clover.Lecture.Lecture;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 수강생 및 일반 사용자에게 노출되는 상세 강의 정보 DTO
@Getter
@AllArgsConstructor
public class StudentLectureDto {
    // 강의 ID
    private Long lectureId;

    // 강좌 정보
    private Long courseId; // 강좌 ID

    // 강의 세부 정보
    private String title; // 강의 제목
    private Integer orderNo; // 강의 순서
    private String videoUrl; // 강의 영상 URL
    private Integer duration; // 재생 시간 (초 단위)

    // Lecture -> DTO 변환 (승인된 강의만 이 DTO로 변환되어 전달됨)
    public static StudentLectureDto fromEntity(Lecture lecture) {
        return new StudentLectureDto(
                lecture.getLectureId(),
                lecture.getCourse().getCourseId(),
                lecture.getTitle(),
                lecture.getOrderNo(),
                lecture.getVideoUrl(),
                lecture.getDuration());
    }
}
