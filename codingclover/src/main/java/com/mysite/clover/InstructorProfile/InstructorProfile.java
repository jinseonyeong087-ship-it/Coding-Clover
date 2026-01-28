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
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name="instructor_profile")
public class InstructorProfile {
  
  @Id // PK
  @Column(name = "user_id")
  private Long userId;

  @Column(name = "bio", columnDefinition = "TEXT")
  private String bio;

  //경력
  @Column(name = "career_years")
  private Integer careerYears;

  //이력서 파일 경로
  @Column(name = "resume_file_path")
  private String resumeFilePath;

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

  // 생성자
  public InstructorProfile(Long userId) {
    this.userId = userId;
  }

}
