package com.mysite.clover.Exam;

import com.mysite.clover.ExamAttempt.ExamAttempt;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

// 사용자의 시험 문제별 답안 정보를 저장하는 엔티티
// 어떤 시도(Attempt)에서, 어떤 문제(Question)에 대해, 몇 번(Option)을 선택했는지 기록합니다.
@Getter
@Setter
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "exam_answer")
public class ExamAnswer {

    // 답안 고유 ID (PK)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long answerId;

    // 어떤 시험 시도에 속한 답안인지 연결 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private ExamAttempt attempt;

    // 어떤 문제에 대한 답안인지 연결 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private ExamQuestion question;

    // 사용자가 선택한 번호 (1 ~ 5)
    @Column(nullable = false)
    private Integer selectedAnswer;

    // 정답 여부 (true: 정답, false: 오답)
    @Column(nullable = false)
    private Boolean isCorrect;

    // 답안 제출 일시 (자동 저장)
    @CreatedDate
    private LocalDateTime answeredAt;
}
