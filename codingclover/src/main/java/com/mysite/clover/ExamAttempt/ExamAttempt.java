package com.mysite.clover.ExamAttempt;

import com.mysite.clover.Exam.Exam;
import com.mysite.clover.Users.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 시험 응시 기록 엔티티
 * 학생의 시험 응시 기록과 결과를 저장합니다.
 */
@Getter
@Setter
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "exam_attempt")
public class ExamAttempt {

    /** 응시 기록 ID (Primary Key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attemptId;

    /** 응시한 시험 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id")
    private Exam exam;

    /** 응시자 (학생) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

    /** 시도 횟수 (1부터 시작) */
    private Integer attemptNo;

    /** 응시 일시 */
    @CreatedDate
    private LocalDateTime attemptedAt;

    /** 획득 점수 */
    private Integer score;

    /** 합격 여부 */
    private Boolean passed;
}
