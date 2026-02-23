package com.mysite.clover.AiQuiz;

import lombok.Data;

@Data
public class AiQuestionDto {
    private String questionText;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private String option5;
    private Integer correctAnswer;
}
