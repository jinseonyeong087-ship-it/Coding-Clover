package com.mysite.clover.ExamAttempt.dto;

import java.time.LocalDateTime;

import com.mysite.clover.ExamAttempt.ExamAttempt;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 시험 응시 내역을 클라이언트에게 전달할 때 사용하는 DTO
@Getter
@AllArgsConstructor
public class ExamAttemptDto {
    private Long attemptId; // 응시 기록 ID
    private Long examId; // 시험 ID
    private Long userId; // 응시자(학생) ID
    private String userName; // 응시자 이름
    private Integer attemptNo; // 시도 횟수
    private Integer score; // 점수
    private Boolean passed; // 합격 여부
    private LocalDateTime attemptedAt; // 응시 일시

    // ExamAttempt 엔티티를 DTO로 변환
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
