package com.mysite.clover.Lecture.dto;

import com.mysite.clover.Lecture.Lecture;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 수강생용 강의 정보 DTO
 * 수강생에게 공개되는 강의의 정보를 담습니다.
 */
@Getter
@AllArgsConstructor
public class StudentLectureDto {
    private Long lectureId;
    private Long courseId;
    private String title;
    private Integer orderNo;
    private String videoUrl;
    private Integer duration;

    /**
     * Entity -> DTO 변환 메서드
     * 
     * @param lecture 강의 Entity
     * @return StudentLectureDto
     */
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
