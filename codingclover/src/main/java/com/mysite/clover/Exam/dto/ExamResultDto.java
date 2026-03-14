package com.mysite.clover.Exam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamResultDto {
    private Integer score;
    private Boolean passed;
    private Integer correctCount;
    private Integer totalQuestions;
    private String message;
}
