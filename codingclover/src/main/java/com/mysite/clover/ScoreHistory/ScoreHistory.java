package com.mysite.clover.ScoreHistory;

import java.time.LocalDateTime;

import com.mysite.clover.Exam.Exam;
import com.mysite.clover.Users.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "score_history")
public class ScoreHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId; // PK: 기록 고유 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam; // FK: 응시한 시험

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user; // FK: 응시한 사용자

    @Column(nullable = false)
    private Integer score; // 획득 점수

    @Column(name = "passed_yn", nullable = false)
    private Boolean passed; // 통과 여부 (DB 컬럼명: passed_yn)

    @Column(nullable = false)
    private Integer attemptNo; // 응시 횟수

    @Column(nullable = false)
    private LocalDateTime createdAt; // 응시 일시
}