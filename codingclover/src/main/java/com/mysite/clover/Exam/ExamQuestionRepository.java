package com.mysite.clover.Exam;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Long> {
    // 특정 시험에 포함된 모든 문제를 조회
    List<ExamQuestion> findByExam(Exam exam);
}
