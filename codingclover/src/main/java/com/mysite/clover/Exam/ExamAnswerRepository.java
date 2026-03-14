package com.mysite.clover.Exam;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.mysite.clover.ExamAttempt.ExamAttempt;

public interface ExamAnswerRepository extends JpaRepository<ExamAnswer, Long> {
    // 특정 응시 기록(Attempt)에 포함된 모든 답안 조회
    List<ExamAnswer> findByAttempt(ExamAttempt attempt);
}
