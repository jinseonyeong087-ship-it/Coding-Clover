package com.mysite.clover.Lecture.dto;

import com.mysite.clover.Lecture.Lecture;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 수강생용 강의 정보 DTO
 * 수강생에게 공개되는 강의의 기본 정보를 담습니다.
 * 학습에 필요한 핵심 정보(제목, 영상, 길이 등)만 포함하며 내부 관리용 데이터는 제외됩니다.
 */
@Getter
@AllArgsConstructor
public class StudentLectureDto {
    // 강의 ID
    private Long lectureId;
    // 강의가 속한 강좌 ID
    private Long courseId;
    // 강의 제목
    private String title;
    // 강의 순서
    private Integer orderNo;
    // 강의 URL
    private String videoUrl;
    // 강의 길이
    private Integer duration;

    // Entity -> DTO 변환 메서드
    public static StudentLectureDto fromEntity(Lecture lecture) {
        return new StudentLectureDto(
                // 강의 ID
                lecture.getLectureId(),
                // 강의가 속한 강좌 ID
                lecture.getCourse().getCourseId(),
                // 강의 제목
                lecture.getTitle(),
                // 강의 순서
                lecture.getOrderNo(),
                // 강의 URL
                lecture.getVideoUrl(),
                // 강의 길이
                lecture.getDuration());
    }
}
