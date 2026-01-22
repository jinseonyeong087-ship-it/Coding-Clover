package com.mysite.clover.ExamAttempt.dto;

import java.time.LocalDateTime;

import com.mysite.clover.ExamAttempt.ExamAttempt;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 시험 응시 기록 DTO
 * 학생의 시험 응시 기록과 결과를 전달하기 위한 DTO입니다.
 */
@Getter
@AllArgsConstructor
public class ExamAttemptDto {
    private Long attemptId;
    private Long examId;
    private Long userId;
    private String userName;
    private Integer attemptNo;
    private Integer score;
    private Boolean passed;
    private LocalDateTime attemptedAt;

    /**
     * Entity -> DTO 변환 메서드
     * 
     * @param attempt 응시 기록 Entity
     * @return ExamAttemptDto
     */
    public static ExamAttemptDto fromEntity(ExamAttempt attempt) {
        return new ExamAttemptDto(
                attempt.getAttemptId(),
                attempt.getExam().getExamId(),
                attempt.getUser().getUserId(),
                attempt.getUser().getName(),
                attempt.getAttemptNo(),
                attempt.getScore(),
                attempt.getPassed(),
                attempt.getAttemptedAt());
    }
}
