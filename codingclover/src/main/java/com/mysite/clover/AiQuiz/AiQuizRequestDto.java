package com.mysite.clover.AiQuiz;

import lombok.Data;

@Data
public class AiQuizRequestDto {
    private String script;
    private String youtubeUrl;
    private int questionCount = 3; // 기본값 3개
}
