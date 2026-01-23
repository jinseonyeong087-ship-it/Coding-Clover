package com.mysite.clover.Course;

import java.time.LocalDateTime;

import com.mysite.clover.Qna.Qna;
import com.mysite.clover.Users.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;
import java.util.List;
import jakarta.persistence.CascadeType;

/**
 * 강좌 엔티티
 * 강좌의 기본 정보를 저장합니다.
 */
@Getter
@Setter
@Entity
public class Course {

    /** 강좌 ID (Primary Key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseId;

    /** 강좌 제목 */
    private String title;

    /** 강좌 설명 (상세 내용) */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** 난이도 (1:초급, 2:중급, 3:고급) */
    private int level;

    /** 수강료 */
    private int price;
    /** 썸네일 이미지 URL */
    private String thumbnailUrl;

    /** 강좌 승인 상태 (PENDING, APPROVED, REJECTED, CLOSED) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseProposalStatus proposalStatus = CourseProposalStatus.PENDING;

    /** 관리자 반려 사유 (반려 시) */
    private String proposalRejectReason;

    /** 승인한 관리자 */
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private Users approvedBy;

    /** 승인 일시 */
    private LocalDateTime approvedAt;

    /** 강좌 개설 강사 */
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private Users createdBy;

    /** 생성 일시 */
    private LocalDateTime createdAt;

    /** 수정 일시 */
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "course", cascade = CascadeType.REMOVE)
    private List<Qna> qnaList;
}
