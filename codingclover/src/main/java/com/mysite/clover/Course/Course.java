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

// 강좌(강의들의 묶음) 정보를 저장하는 엔티티
// (제목, 설명, 가격, 강사 정보, 승인 상태 등을 관리)
@Getter
@Setter
@Entity
public class Course {

    // 강좌 고유 식별자 (PK)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseId;

    // 강좌 제목 (필수값)
    private String title;

    // 강좌 상세 설명 (TEXT 타입으로 지정하여 긴 내용 허용)
    @Column(columnDefinition = "TEXT")
    private String description;

    // 강좌 난이도 (1:초급, 2:중급, 3:고급 등)
    private int level;

    // 수강료 (원 단위)
    private int price;

    // 강좌 썸네일 이미지의 URL 주소
    private String thumbnailUrl;

    // 강좌 승인 상태 (대기, 승인, 반려, 종료 등) - 문자열로 저장
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseProposalStatus proposalStatus = CourseProposalStatus.PENDING;

    // 관리자가 반려했을 경우, 그 사유를 저장하는 필드
    private String proposalRejectReason;

    // 이 강좌를 승인한 관리자 정보 (Users 엔티티와 다대일 관계)
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private Users approvedBy;

    // 강좌 승인 일시
    private LocalDateTime approvedAt;

    // 이 강좌를 개설한 강사 정보 (Users 엔티티와 다대일 관계, 필수값)
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private Users createdBy;

    // 강좌 생성 일시
    private LocalDateTime createdAt;

    // 강좌 정보 수정 일시
    private LocalDateTime updatedAt;

    // 이 강좌에 달린 Q&A 목록 (강좌 삭제 시 Q&A도 함께 삭제됨 - CascadeType.REMOVE)
    @OneToMany(mappedBy = "course", cascade = CascadeType.REMOVE)
    private List<Qna> qnaList;

    // 강좌를 생성한 강사 정보를 반환하는 편의 메서드
    public Users getInstructor() {
        return this.createdBy;
    }
}
