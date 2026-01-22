package com.mysite.clover.Exam;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExamForm {

    @NotNull(message = "강좌 ID는 필수입니다.")
    private Long courseId;

    @NotBlank(message = "시험 제목은 필수입니다.")
    private String title;

    @NotNull(message = "제한시간은 필수입니다.")
    private Integer timeLimit;

    @NotNull(message = "난이도는 필수입니다.")
    private Integer level;

    @NotNull(message = "통과 기준 점수는 필수입니다.")
    private Integer passScore;
}
