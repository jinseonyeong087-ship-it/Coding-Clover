package com.mysite.clover.ScoreHistory;

import com.mysite.clover.Exam.Exam;
import com.mysite.clover.Users.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScoreHistoryRepository extends JpaRepository<ScoreHistory, Long> {
    // 수강생용: 내 성적 목록 최신순 조회
    List<ScoreHistory> findByUserOrderByCreatedAtDesc(Users user);

    // 강사용: 특정 시험의 모든 응시 기록 조회
    List<ScoreHistory> findByExamOrderByCreatedAtDesc(Exam exam);

    // 시도 횟수 계산용
    List<ScoreHistory> findByUserAndExamOrderByAttemptNoDesc(Users user, Exam exam);
}