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
    // 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseId;
    // 강좌 제목
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private int level;

    private int price;

    private String thumbnailUrl;

    @Enumerated(EnumType.STRING)
    private CourseProposalStatus proposalStatus;

    private String proposalRejectReason;

    @ManyToOne
    private Users approvedBy;

    private LocalDateTime approvedAt;

    @ManyToOne
    private Users createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
