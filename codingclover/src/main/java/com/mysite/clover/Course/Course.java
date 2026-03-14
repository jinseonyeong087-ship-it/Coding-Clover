package com.mysite.clover.Course;

import java.time.LocalDateTime;
import java.util.List;

import com.mysite.clover.Qna.Qna;
import com.mysite.clover.Users.Users;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;

// 강좌 정보 엔티티
@Getter
@Setter
@Entity
public class Course {

    // 강좌 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseId;

    // 제목
    private String title;

    // 상세 설명
    @Column(columnDefinition = "TEXT")
    private String description;

    // 난이도
    private int level;

    // 수강료
    private int price;

    // 썸네일 URL
    private String thumbnailUrl;

    // 승인 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseProposalStatus proposalStatus = CourseProposalStatus.PENDING;

    // 반려 사유
    private String proposalRejectReason;

    // 승인 관리자
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private Users approvedBy;

    // 승인 일시
    private LocalDateTime approvedAt;

    // 개설 강사
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private Users createdBy;

    // 생성 일시
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 수정 일시
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Q&A 목록
    @OneToMany(mappedBy = "course", cascade = CascadeType.REMOVE)
    private List<Qna> qnaList;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 강사 정보 편의 메서드
    public Users getInstructor() {
        return this.createdBy;
    }

    // 강사 이름
    public String getInstructorName() {
        return this.createdBy != null ? this.createdBy.getName() : null;
    }
}
