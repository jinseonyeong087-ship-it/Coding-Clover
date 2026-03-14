package com.mysite.clover.LectureProgress;

import java.time.LocalDateTime;

import com.mysite.clover.Enrollment.Enrollment;
import com.mysite.clover.Lecture.Lecture;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "lecture_progress")
public class LectureProgress {
  
  @Id // PK
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "progress_id")
  private Long progressId;

  // 수강 정보
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "enrollment_id", nullable = false)
  private Enrollment enrollment;

  // 강의 정보
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "lecture_id", nullable = false)
  private Lecture lecture;

  // 진도율 (0~100)
  @Column(name = "progress_rate", nullable = false)
  private Integer progressRate = 0;

  // 완료 여부
  @Column(name = "completed_yn", nullable = false)
  private Boolean completedYn = false;

  // 마지막 시청 시간
  @Column(name = "last_watched_at")
  private LocalDateTime lastWatchedAt;

}
