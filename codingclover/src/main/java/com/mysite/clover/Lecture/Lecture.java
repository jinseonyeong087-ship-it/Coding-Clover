package com.mysite.clover.Lecture;

import java.time.LocalDateTime;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Lecture {

    // 강의 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long lectureId;

    // 강좌
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // 강의 제목
    @Column(nullable = false)
    private String title;

    // 강의 순서
    @Column(nullable = false)
    private int orderNo;

    // 영상 URL
    @Column(nullable = false)
    private String videoUrl;

    // 영상 길이
    @Column(nullable = false)
    private int duration;

    // 등록 강사
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private Users createdBy;

    // 승인 상태 (PENDING / APPROVED / REJECTED / INACTIVE)
    @Column(nullable = false)
    private String approvalStatus;

    // 반려 사유
    @Column(columnDefinition = "TEXT")
    private String rejectReason;

    // 승인 관리자
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private Users approvedBy;

    // 승인 일시
    private LocalDateTime approvedAt;

    public void setCreatedAt(LocalDateTime now) {
      // TODO Auto-generated method stub
      throw new UnsupportedOperationException("Unimplemented method 'setCreatedAt'");
    }
}
