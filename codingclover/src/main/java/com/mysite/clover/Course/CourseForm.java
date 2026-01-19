package com.mysite.clover.Course;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseForm {

    @NotEmpty(message = "제목은 필수")
    private String title;

    @NotEmpty(message = "설명은 필수")
    private String description;

    @NotNull(message = "가격 필수")
    private Integer price;

    @NotNull(message = "난이도 필수")
    private Integer level;
}