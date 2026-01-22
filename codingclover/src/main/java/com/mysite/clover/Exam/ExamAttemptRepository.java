package com.mysite.clover.Exam;

import com.mysite.clover.Users.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    List<ExamAttempt> findByExamAndUser(Exam exam, Users user);

    List<ExamAttempt> findByExam(Exam exam);

    Optional<ExamAttempt> findTopByExamAndUserOrderByAttemptNoDesc(Exam exam, Users user);
}
