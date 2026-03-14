package com.mysite.clover.Submission;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mysite.clover.Problem.Problem;
import com.mysite.clover.Problem.ProblemRepository;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/submission")
public class SubmissionController {

  private final SubmissionRepository submissionRepository;
  private final UsersRepository usersRepository;
  private final ProblemRepository problemRepository;

  // 유저의 제출 이력 조회 (문제 ID는 선택)
  @GetMapping("/history")
  public List<SubmissionResponse> getHistory(@RequestParam("userId") Long userId,
      @RequestParam(value = "problemId", required = false) Long problemId) {
    Users user = usersRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

    List<Submission> submissions;
    if (problemId != null) {
      Problem problem = problemRepository.findById(problemId)
          .orElseThrow(() -> new RuntimeException("Problem not found"));
      submissions = submissionRepository.findByUsersAndProblem(user, problem);
    } else {
      submissions = submissionRepository.findByUsers(user);
    }

    return submissions.stream()
        .map(submission -> SubmissionResponse.builder()
            .id(submission.getId())
            .problemId(submission.getProblem().getProblemId())
            .problemTitle(submission.getProblem().getTitle())
            .code(submission.getCode())
            .status(submission.getStatus())
            .executionTime(submission.getExecutionTime())
            .createdAt(submission.getCreatedAt())
            .build())
        .toList();
  }
}
