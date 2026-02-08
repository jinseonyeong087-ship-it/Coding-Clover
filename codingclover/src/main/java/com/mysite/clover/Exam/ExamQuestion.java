package com.mysite.clover.Exam;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

// 시험 문제(Question) 정보를 저장하는 엔티티
// 강좌별 시험에 포함될 5지선다형 문제를 관리합니다.
@Getter
@Setter
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "exam_question")
public class ExamQuestion {

    // 문제 고유 ID (PK)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long questionId;

    // 어떤 시험에 속한 문제인지 연결 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    // 문제 내용 (질문 텍스트)
    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    // 보기 1번
    @Column(nullable = false)
    private String option1;

    // 보기 2번
    @Column(nullable = false)
    private String option2;

    // 보기 3번
    @Column(nullable = false)
    private String option3;

    // 보기 4번
    @Column(nullable = false)
    private String option4;

    // 보기 5번
    @Column(nullable = false)
    private String option5;

    // 정답 번호 (1 ~ 5)
    @Column(nullable = false)
    private Integer correctAnswer;

    // 문제 생성 일시 (자동 저장)
    @CreatedDate
    private LocalDateTime createdAt;
}
