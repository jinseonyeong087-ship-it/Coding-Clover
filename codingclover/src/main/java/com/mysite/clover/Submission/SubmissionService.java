package com.mysite.clover.Submission;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mysite.clover.Problem.Problem;
import com.mysite.clover.Users.Users;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubmissionService {

  private final SubmissionRepository submissionRepository;

  @Transactional
  public Submission create(Users user, Problem problem, String code, String status, Long executionTime) {
    Submission submission = new Submission();
    submission.setUsers(user);
    submission.setProblem(problem);
    submission.setSourceCode(code);  // 직접 sourceCode 설정
    submission.setStatus(status);
    submission.setExecutionTime(executionTime);
    submission.setCreatedAt(java.time.LocalDateTime.now());

    return submissionRepository.save(submission);
  }

  public List<Submission> findByProblem(Problem problem) {
    // 리포지토리를 호출하여 실제 DB 데이터를 가져오도록 구현
    return submissionRepository.findByProblem(problem);
}
}
