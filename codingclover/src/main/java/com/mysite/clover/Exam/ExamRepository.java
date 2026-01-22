package com.mysite.clover.Exam;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

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
}
