package com.mysite.clover.AiQuiz;

import lombok.Data;
import java.util.List;

@Data
public class AiQuizResponseDto {
    private List<AiQuestionDto> questions;
}
