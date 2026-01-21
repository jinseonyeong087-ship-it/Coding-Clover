package com.mysite.clover.Lecture;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LectureForm {

    // 강의 제목
    @NotEmpty(message = "강의 제목은 필수")
    private String title;

    // 강의 순서
    @NotNull(message = "강의 순서는 필수")
    private Integer orderNo;

    // 영상 URL
    @NotEmpty(message = "영상 URL은 필수")
    private String videoUrl;

    // 강의 길이 (분 or 초 기준, 너희 기준대로)
    @NotNull(message = "강의 길이는 필수")
    private Integer duration;
}
