package com.mysite.clover.Submission;

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
    submission.setCode(code);
    submission.setStatus(status);
    submission.setExecutionTime(executionTime);
    submission.setCreatedAt(java.time.LocalDateTime.now());

    return submissionRepository.save(submission);
  }
}
