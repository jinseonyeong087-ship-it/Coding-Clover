package com.mysite.clover.InstructorProfile;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.mysite.clover.Users.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name="instructor_profile")
public class InstructorProfile {
  
  @Id // PK
    @Column(name = "user_id")
    private Long userId;

  //1:1 Users와 매핑
  @OneToOne
    @MapsId  // userId를 Users의 PK와 매핑
    @JoinColumn(name = "user_id")
    private Users user;

  @Column(name = "bio", columnDefinition = "TEXT")
  private String bio;

  //경력
  @Column(name = "career_years")
  private Integer careerYears;

  //승인상태
  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private InstructorStatus status = InstructorStatus.APPLIED;

  //강사 신청 일시
  @CreationTimestamp
  @Column(name = "applied_at", nullable = false, updatable = false)
  private LocalDateTime appliedAt;

  //관리자 승인 일시
  @Column(name = "approved_at")
  private LocalDateTime approvedAt;

}
