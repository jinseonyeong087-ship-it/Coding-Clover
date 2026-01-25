package com.mysite.clover.Lecture;

import java.time.LocalDateTime;

import com.mysite.clover.Course.Course;
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
import lombok.Getter;
import lombok.Setter;

// 강좌 내의 개별 강의(동영상 등) 정보를 저장하는 엔티티
@Getter
@Setter
@Entity
public class Lecture {

  // 강의 고유 식별자 (DB Primary Key, 자동 증가)
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long lectureId;

  // 이 강의가 소속된 강좌 (다대일 관계, 필수값)
  @ManyToOne
  @JoinColumn(name = "course_id", nullable = false)
  private Course course;

  // 강의 제목 (필수값)
  @Column(nullable = false)
  private String title;

  // 강의 순서 (1강, 2강... 등 순서를 나타내는 번호, 필수값)
  @Column(nullable = false)
  private int orderNo;

  // 강의 영상 URL (예: S3 링크, 유튜브 링크 등, 필수값)
  @Column(nullable = false)
  private String videoUrl;

  // 영상의 재생 시간 (초 단위, 필수값)
  @Column(nullable = false)
  private int duration;

  // 강의를 등록한 강사 정보 (필수값)
  @ManyToOne
  @JoinColumn(name = "created_by", nullable = false)
  private Users createdBy;

  // 강의 생성 일시 (업로드 날짜)
  private LocalDateTime createdAt;

  // 강의 승인 상태 (기본값: PENDING - 대기중)
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private LectureApprovalStatus approvalStatus = LectureApprovalStatus.PENDING;

  // 관리자가 반려했을 경우, 그 사유를 저장 (TEXT 타입으로 긴 내용 허용)
  @Column(columnDefinition = "TEXT")
  private String rejectReason;

  // 강의를 승인한 관리자 정보 (승인 시점에 기록)
  @ManyToOne
  @JoinColumn(name = "approved_by")
  private Users approvedBy;

  // 강의 승인 일시 (승인 시점에 기록)
  private LocalDateTime approvedAt;
}
