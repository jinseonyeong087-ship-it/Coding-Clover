package com.mysite.clover.ExamAttempt;

import com.mysite.clover.Exam.Exam;
import com.mysite.clover.Users.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 시험 응시 기록 리포지토리
 * 시험 응시 이력을 조회하는 메서드를 제공합니다.
 * 강사를 위한 시험별 전체 이력 조회, 수강생을 위한 본인 이력 조회 기능 등이 포함됩니다.
 */
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    // 특정 시험의 모든 응시 기록 (강사용)
    List<ExamAttempt> findByExam(Exam exam);

    // 특정 사용자의 특정 시험 응시 기록 (수강생용)
    List<ExamAttempt> findByExamAndUser(Exam exam, Users user);

    // 가장 최근 응시 기록 찾기 (횟수 계산용)
    Optional<ExamAttempt> findTopByExamAndUserOrderByAttemptNoDesc(Exam exam, Users user);
}
