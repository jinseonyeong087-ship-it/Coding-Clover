package com.mysite.clover.ExamAttempt;

import com.mysite.clover.Exam.Exam;
import com.mysite.clover.Users.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// 시험 응시 기록(ExamAttempt) 데이터에 대한 DB 접근 리포지토리
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {

    // 특정 시험에 대한 모든 응시 기록 조회 (강사가 전체 학생의 성적을 확인할 때 등)
    List<ExamAttempt> findByExam(Exam exam);

    // 특정 사용자가 특정 시험에 응시한 모든 기록 조회 (사용자가 본인의 이력을 볼 때)
    List<ExamAttempt> findByExamAndUser(Exam exam, Users user);

    // 특정 사용자의 특정 시험 응시 기록 중 '시도 횟수(attemptNo)'가 가장 높은(최근) 기록 1개 조회
    // 다음 시도 횟수를 결정하거나, 최종 성적을 확인할 때 유용함
    Optional<ExamAttempt> findTopByExamAndUserOrderByAttemptNoDesc(Exam exam, Users user);

    // 해당 시험에 대한 응시 기록이 존재하는지 확인 (시험 수정 시 문제 변경 가능 여부 체크용)
    boolean existsByExam(Exam exam);
}
