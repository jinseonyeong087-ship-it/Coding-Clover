package com.mysite.clover.Lecture.dto;

import com.mysite.clover.Lecture.Lecture;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 비로그인 사용자에게 노출되는 강의 미리보기 DTO (순서, 제목만 제공)
@Getter
@AllArgsConstructor
public class LecturePreviewDto {
    private int orderNo;
    private String title;

    public static LecturePreviewDto fromEntity(Lecture lecture) {
        return new LecturePreviewDto(
                lecture.getOrderNo(),
                lecture.getTitle());
    }
}
