package com.mysite.clover.Exam;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExamAttemptDto {
    private Long attemptId;
    private Long examId;
    private Long userId;
    private String userName;
    private Integer attemptNo;
    private Integer score;
    private Boolean passed;
    private LocalDateTime attemptedAt;

    public ExamAttemptDto(ExamAttempt attempt) {
        this.attemptId = attempt.getAttemptId();
        this.examId = attempt.getExam().getExamId();
        this.userId = attempt.getUser().getUserId();
        // this.userName = attempt.getUser().getName(); // User 엔티티에 getName 체크 필요
        this.attemptNo = attempt.getAttemptNo();
        this.score = attempt.getScore();
        this.passed = attempt.getPassed();
        this.attemptedAt = attempt.getAttemptedAt();
    }
}
