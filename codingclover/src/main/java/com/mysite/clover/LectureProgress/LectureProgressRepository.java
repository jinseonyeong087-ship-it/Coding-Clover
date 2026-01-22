package com.mysite.clover.LectureProgress;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mysite.clover.Enrollment.Enrollment;
import com.mysite.clover.Lecture.Lecture;

public interface LectureProgressRepository extends JpaRepository<LectureProgress, Long> {
    List<LectureProgress> findByEnrollment(Enrollment enrollment);

    Optional<LectureProgress> findByEnrollmentAndLecture(Enrollment enrollment, Lecture lecture);

    long countByEnrollmentAndCompletedYnTrue(Enrollment enrollment);
}
