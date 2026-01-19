package com.mysite.clover.Course;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseForm {

    // 강좌 제목
    @NotEmpty(message = "제목은 필수")
    private String title;

    // 강좌 설명
    @NotEmpty(message = "설명은 필수")
    private String description;

    // 강좌 가격
    @NotNull(message = "가격 필수")
    private int price;

    // 강좌 난이도
    @NotNull(message = "난이도 필수")
    private int level;
}