package com.mysite.clover.ExamAttempt;

import com.mysite.clover.Exam.Exam;
import com.mysite.clover.Users.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    /**
     * 특정 시험의 특정 사용자 응시 기록 조회
     * 
     * @param exam 시험
     * @param user 사용자
     * @return 응시 기록 목록
     */
    List<ExamAttempt> findByExamAndUser(Exam exam, Users user);

    /**
     * 특정 시험의 모든 응시 기록 조회
     * 
     * @param exam 시험
     * @return 응시 기록 목록
     */
    List<ExamAttempt> findByExam(Exam exam);

    /**
     * 특정 시험의 특정 사용자 최근 응시 기록 조회
     * 다음 시도 횟수를 결정하기 위해 사용
     * 
     * @param exam 시험
     * @param user 사용자
     * @return 최근 응시 기록
     */
    Optional<ExamAttempt> findTopByExamAndUserOrderByAttemptNoDesc(Exam exam, Users user);
}
