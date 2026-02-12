package com.mysite.clover.Exam;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 시험(Exam) 데이터에 대한 DB 접근을 담당하는 리포지토리
public interface ExamRepository extends JpaRepository<Exam, Long> {

    // 특정 강좌에 포함된 모든 시험 목록 조회
    List<Exam> findByCourse(Course course);

    // 특정 강자가 출제한 모든 시험 목록 조회
    List<Exam> findByCreatedBy(Users user);


    // 강좌 삭제 시 관련 시험 삭제
    void deleteByCourse(Course course);
}
