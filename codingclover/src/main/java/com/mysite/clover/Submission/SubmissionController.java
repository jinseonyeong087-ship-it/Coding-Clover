package com.mysite.clover.Submission;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable; // Lint: unused but kept for potential future use or consistent with file
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mysite.clover.Problem.Problem;
import com.mysite.clover.Problem.ProblemRepository;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.Data;
import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/submission")
public class SubmissionController {

  private final SubmissionRepository submissionRepository;
  private final UsersRepository usersRepository;
  private final ProblemRepository problemRepository;
  private final SubmissionService submissionService;

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

  // 제출 저장 (테스트용/실제용)
  @PostMapping("/submit")
  public SubmissionResponse submit(@RequestBody SubmissionSubmitRequest request) {
    Users user = usersRepository.findById(request.getUserId())
        .orElseThrow(() -> new RuntimeException("User not found"));
    Problem problem = problemRepository.findById(request.getProblemId())
        .orElseThrow(() -> new RuntimeException("Problem not found"));

    Submission submission = submissionService.create(user, problem, request.getCode(), request.getStatus(),
        request.getExecutionTime());

    return SubmissionResponse.builder()
        .id(submission.getId())
        .problemId(submission.getProblem().getProblemId())
        .problemTitle(submission.getProblem().getTitle())
        .code(submission.getCode())
        .status(submission.getStatus())
        .executionTime(submission.getExecutionTime())
        .createdAt(submission.getCreatedAt())
        .build();
  }

  @Data
  public static class SubmissionSubmitRequest {
    private Long userId;
    private Long problemId;
    private String code;
    private String status;
    private Long executionTime;
  }
}
