package com.mysite.clover.LectureProgress;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.mysite.clover.Enrollment.Enrollment;
import com.mysite.clover.Lecture.Lecture;

public interface LectureProgressRepository extends JpaRepository<LectureProgress, Long> {

  // 특정 수강생의 특정 강의 진도 조회
  Optional<LectureProgress> findByEnrollmentAndLecture(Enrollment enrollment, Lecture lecture);

  // 특정 수강생의 모든 강의 진도 조회
  List<LectureProgress> findByEnrollment(Enrollment enrollment);

  // 특정 수강생의 완료한 강의 목록
  List<LectureProgress> findByEnrollmentAndCompletedYnTrue(Enrollment enrollment);

  // 특정 강의를 수강하는 모든 학생들의 진도 조회, 페이징 처리
  Page<LectureProgress> findByLecture(Lecture lecture, Pageable pageable);

  // 최근 시청한 강의 조회 (시청 시간 기준 내림차순)
  List<LectureProgress> findByEnrollmentAndLastWatchedAtIsNotNullOrderByLastWatchedAtDesc(Enrollment enrollment);

  // 강의 삭제 시 해당 강의의 모든 진도 내역 삭제
  void deleteByLecture(Lecture lecture);
}
