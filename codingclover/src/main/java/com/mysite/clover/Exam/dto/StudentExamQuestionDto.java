package com.mysite.clover.Exam.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class StudentExamQuestionDto {
    private Long questionId; // 답안 제출 시 필요할 수 있음
    private String questionText;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private String option5;
    // 정답(correctAnswer)은 포함하지 않음
}
