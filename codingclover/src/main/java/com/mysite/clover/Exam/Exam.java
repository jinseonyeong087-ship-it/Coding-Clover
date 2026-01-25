package com.mysite.clover.Exam;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

// 시험(Test/Exam) 정보를 저장하는 엔티티
@Getter
@Setter
@Entity
public class Exam {

    // 시험 고유 식별자 (PK)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long examId;

    // 이 시험이 속한 강좌 정보 (다대일 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    // 시험 제목 (최대 100자)
    @Column(length = 100)
    private String title;

    // 제한 시간 (분 단위)
    private Integer timeLimit;

    // 시험 난이도 (1:초급, 2:중급, 3:고급 등 숫자 코드로 관리)
    private Integer level;

    // 합격 기준 점수 (예: 60점 이상 합격)
    private Integer passScore;

    // 시험을 출제한 강사 정보
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Users createdBy;

    // 시험 공개 여부 (false: 비공개, true: 공개) - 기본값은 false
    @Column(nullable = false)
    private Boolean isPublished = false;
}
