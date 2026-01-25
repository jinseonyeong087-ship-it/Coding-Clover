package com.mysite.clover.Exam;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * 시험 엔티티
 * 강좌 내에서 학생들이 응시할 수 있는 시험 정보를 저장합니다.
 * 시험 제목, 제한 시간, 난이도, 합격 점수 등을 관리하며,
 * 강사가 출제하고 관리자가 승인하는 구조가 아닌 강사가 직접 생성 후 공개 여부를 설정합니다.
 */
@Getter
@Setter
@Entity
public class Exam {

    /** 시험 ID (Primary Key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long examId;

    /** 소속 강좌 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    /** 시험 제목 */
    @Column(length = 100)
    private String title;

    /** 제한 시간 (분 단위) */
    private Integer timeLimit;

    /** 난이도 (1:초급, 2:중급, 3:고급) */
    private Integer level;

    /** 합격 기준 점수 */
    private Integer passScore;

    /** 시험 출제 강사 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Users createdBy;

    /** 시험 공개 여부 */
    @Column(nullable = false)
    private Boolean isPublished = false; // 기본값은 비공개
}
