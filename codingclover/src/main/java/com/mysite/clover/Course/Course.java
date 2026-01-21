package com.mysite.clover.Course;

import java.time.LocalDateTime;

import com.mysite.clover.Users.Users;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Course {

    // 강좌 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseId;
    // 강좌 제목
    private String title;

    // 강좌 설명
    @Column(columnDefinition = "TEXT")
    private String description;
    // 난이도
    private int level;
    // 가격
    private int price;
    // 썸네일 이미지 URL
    private String thumbnailUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseProposalStatus proposalStatus = CourseProposalStatus.PENDING;

    // 거절 사유
    private String proposalRejectReason;

    // 승인한 사용자
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private Users approvedBy;
    // 승인 일시
    private LocalDateTime approvedAt;

    // 생성한 사용자
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private Users createdBy;
    // 생성 일시
    private LocalDateTime createdAt;
    // 수정 일시
    private LocalDateTime updatedAt;
}
