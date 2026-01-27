package com.mysite.clover.Enrollment;

import java.time.LocalDateTime;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "enrollment")
public class Enrollment {

  @Id // PK
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "enrollment_id")
  private Long enrollmentId;

  // 수강생
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private Users user;

  // 강좌
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "course_id", nullable = false)
  private Course course;

  // 수강일
  @Column(name = "enrolled_at", nullable = false, updatable = false)
  private LocalDateTime enrolledAt;

  // 상태 수강중/수강완료/수강취소
  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private EnrollmentStatus status = EnrollmentStatus.ENROLLED;

  // 수강 시작 시 진단/선택 레벨
  @Column(name = "initial_level", nullable = false)
  private Integer initialLevel;

  // 현재 도달한 학습 레벨
  @Column(name = "current_level", nullable = false)
  private Integer currentLevel;

  // 수강취소자
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "cancelled_by")
  private Users cancelledBy;

  // 수강취소일
  @Column(name = "cancelled_at")
  private LocalDateTime cancelledAt;

  // JPA 기본 생성자
  public Enrollment() {
  }

  // 수강 신청 시 사용하는 생성자(진단할 수 있는 시험 기능이 없어 일단 초급으로 설정)
  public Enrollment(Users user, Course course) {
    this.user = user;
    this.course = course;
    this.enrolledAt = LocalDateTime.now();
    this.status = EnrollmentStatus.ENROLLED;
    this.initialLevel = 1; // 초기 레벨 설정
    this.currentLevel = 1; // 초기 레벨 설정
  }

  // 수강 취소 행위자
  public void cancel(Users actor) {
    this.status = EnrollmentStatus.CANCELLED;
    this.cancelledBy = actor;
    this.cancelledAt = LocalDateTime.now();
  }

  // 수강 완료 처리
  public void complete() {
    this.status = EnrollmentStatus.COMPLETED;
  }
}