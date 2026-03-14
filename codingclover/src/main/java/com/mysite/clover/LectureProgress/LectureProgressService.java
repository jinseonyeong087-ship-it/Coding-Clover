package com.mysite.clover.LectureProgress;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mysite.clover.Enrollment.Enrollment;
import com.mysite.clover.Lecture.Lecture;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LectureProgressService {
  
  private final LectureProgressRepository lectureProgressRepository;

  
  // 강의 완료 처리
  @Transactional
  public LectureProgress completeLecture(Enrollment enrollment, Lecture lecture) {
    Optional<LectureProgress> existingProgress = lectureProgressRepository
        .findByEnrollmentAndLecture(enrollment, lecture);
    
    LectureProgress progress;
    if (existingProgress.isPresent()) {
      progress = existingProgress.get();
    } else {
      progress = new LectureProgress();
      progress.setEnrollment(enrollment);
      progress.setLecture(lecture);
      progress.setProgressRate(0);
    }
    
    progress.setCompletedYn(true);
    progress.setProgressRate(100);
    progress.setLastWatchedAt(LocalDateTime.now());
    
    return lectureProgressRepository.save(progress);
  }

  // 특정 수강생의 특정 강의 완료 상태 조회
  public boolean isLectureCompleted(Enrollment enrollment, Lecture lecture) {
    Optional<LectureProgress> progress = lectureProgressRepository
        .findByEnrollmentAndLecture(enrollment, lecture);
    
    return progress.map(LectureProgress::getCompletedYn).orElse(false);
  }

  // 특정 수강생의 모든 강의 진도 조회
  public List<LectureProgress> getAllProgressByEnrollment(Enrollment enrollment) {
    return lectureProgressRepository.findByEnrollment(enrollment);
  }

  // 특정 수강생의 완료한 강의 목록 조회
  public List<LectureProgress> getCompletedLectures(Enrollment enrollment) {
    return lectureProgressRepository.findByEnrollmentAndCompletedYnTrue(enrollment);
  }

  // 특정 강의를 수강하는 모든 학생들의 진도 조회 (페이징)
  public Page<LectureProgress> getProgressByLecture(Lecture lecture, Pageable pageable) {
    return lectureProgressRepository.findByLecture(lecture, pageable);
  }

  // 최근 시청한 강의 목록 조회
  public List<LectureProgress> getRecentWatchedLectures(Enrollment enrollment) {
    return lectureProgressRepository.findByEnrollmentAndLastWatchedAtIsNotNullOrderByLastWatchedAtDesc(enrollment);
  }

  // 특정 수강생의 완료한 강의 수 조회
  public int getCompletedLectureCount(Enrollment enrollment) {
    List<LectureProgress> completedLectures = lectureProgressRepository
        .findByEnrollmentAndCompletedYnTrue(enrollment);
    return completedLectures.size();
  }

  // 강의 시청 기록 업데이트 (완료 처리는 별도)
  @Transactional
  public LectureProgress updateLastWatched(Enrollment enrollment, Lecture lecture) {
    Optional<LectureProgress> existingProgress = lectureProgressRepository
        .findByEnrollmentAndLecture(enrollment, lecture);
    
    LectureProgress progress;
    if (existingProgress.isPresent()) {
      progress = existingProgress.get();
    } else {
      progress = new LectureProgress();
      progress.setEnrollment(enrollment);
      progress.setLecture(lecture);
      progress.setProgressRate(0);
      progress.setCompletedYn(false);
    }
    
    progress.setLastWatchedAt(LocalDateTime.now());
    
    return lectureProgressRepository.save(progress);
  }

  public Page<AdminLectureProgressDto> getAllProgressForAdmin(Pageable pageable) {
    return lectureProgressRepository.findAll(pageable)
        .map(p -> new AdminLectureProgressDto(
            p.getProgressId(),
            p.getLecture().getCourse().getCourseId(),
            p.getLecture().getCourse().getTitle(),
            p.getLecture().getLectureId(),
            p.getLecture().getTitle(),
            p.getEnrollment().getUser().getUserId(),
            p.getEnrollment().getUser().getName(),
            p.getCompletedYn(),
            p.getLastWatchedAt(),
            p.getEnrollment().getStatus()
        ));
}


}
