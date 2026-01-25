package com.mysite.clover.ExamAttempt;

import com.mysite.clover.Exam.Exam;
import com.mysite.clover.Users.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

// 사용자의 시험 응시 내역(시도 기록)을 저장하는 엔티티
@Getter
@Setter
@Entity
@EntityListeners(AuditingEntityListener.class) // 생성일 자동 주입을 위한 리스너
@Table(name = "exam_attempt")
public class ExamAttempt {

    // 응시 기록 고유 ID (PK)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attemptId;

    // 어떤 시험을 응시했는지 (시험 정보)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id")
    private Exam exam;

    // 누가 응시했는지 (사용자/학생 정보)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

    // 몇 번째 시도인지 (1회차, 2회차...)
    private Integer attemptNo;

    // 실제 응시한 날짜 및 시간 (자동 저장)
    @CreatedDate
    private LocalDateTime attemptedAt;

    // 이번 시도에서 획득한 점수
    private Integer score;

    // 합격 여부 (true: 합격, false: 불합격)
    private Boolean passed;
}
