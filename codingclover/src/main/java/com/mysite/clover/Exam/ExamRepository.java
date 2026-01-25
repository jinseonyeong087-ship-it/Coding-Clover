package com.mysite.clover.Exam;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 시험 리포지토리
 * 시험 데이터에 대한 CRUD 작업을 담당합니다.
 * 특정 강좌에 속한 시험, 특정 강사가 출제한 시험, 공개된 시험 등을 조회하는 기능을 제공합니다.
 */
public interface ExamRepository extends JpaRepository<Exam, Long> {
    /**
     * 강좌별 시험 목록 조회
     * 
     * @param course 강좌
     * @return 시험 목록
     */
    List<Exam> findByCourse(Course course);

    /**
     * 강사별 시험 목록 조회
     * 
     * @param user 강사
     * @return 시험 목록
     */
    List<Exam> findByCreatedBy(Users user);

    // 공개된 시험 목록 조회
    List<Exam> findByCourseAndIsPublishedTrue(Course course);
}
