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

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "enrollment_id")
  private Long enrollmentId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private Users user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "course_id", nullable = false)
  private Course course;

  @Column(name = "enrolled_at", nullable = false, updatable = false)
  private LocalDateTime enrolledAt;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private EnrollmentStatus status = EnrollmentStatus.ENROLLED;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "cancelled_by")
  private Users cancelledBy;

  @Column(name = "cancelled_at")
  private LocalDateTime cancelledAt;
}
