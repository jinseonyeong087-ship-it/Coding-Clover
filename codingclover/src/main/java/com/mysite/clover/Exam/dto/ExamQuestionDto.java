package com.mysite.clover.Exam.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ExamQuestionDto {

    // 문제 내용 (필수)
    @NotBlank(message = "문제 내용은 필수입니다.")
    private String questionText;

    // 보기 1 (필수)
    @NotBlank(message = "보기 1은 필수입니다.")
    private String option1;

    // 보기 2 (필수)
    @NotBlank(message = "보기 2는 필수입니다.")
    private String option2;

    // 보기 3 (필수)
    @NotBlank(message = "보기 3은 필수입니다.")
    private String option3;

    // 보기 4 (필수)
    @NotBlank(message = "보기 4는 필수입니다.")
    private String option4;

    // 보기 5 (필수)
    @NotBlank(message = "보기 5는 필수입니다.")
    private String option5;

    // 정답 번호 (1~5 필수)
    @NotNull(message = "정답 번호는 필수입니다.")
    @Min(value = 1, message = "정답은 1 이상이어야 합니다.")
    @Max(value = 5, message = "정답은 5 이하이어야 합니다.")
    private Integer correctAnswer;
}
