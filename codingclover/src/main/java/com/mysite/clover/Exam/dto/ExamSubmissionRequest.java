package com.mysite.clover.Exam.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class ExamSubmissionRequest {
    // Key: Question ID, Value: Selected Option (1-5)
    private Map<Long, Integer> answers;
}
