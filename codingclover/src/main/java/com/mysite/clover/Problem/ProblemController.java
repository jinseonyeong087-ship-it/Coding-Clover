package com.mysite.clover.Problem;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/problems")
@RestController
public class ProblemController {

  private final ProblemRepository problemRepository;
  private final CodeExecutor codeExecutor;
  private final com.mysite.clover.Submission.SubmissionService submissionService;
  private final com.mysite.clover.Users.UsersRepository usersRepository;

  // 문제 목록 조회 (최근 작성 순)
  @GetMapping
  public List<Problem> list() {
    return problemRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
  }

  // 문제 상세 조회
  @GetMapping("/{id}")
  public ResponseEntity<Problem> detail(@PathVariable("id") Long id) {
    return problemRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  // 문제 등록 (관리자/강사 용)
  @PostMapping
  public Problem create(@RequestBody Problem problem) {
    return problemRepository.save(problem);
  }

  // 문제 수정
  @PutMapping("/{id}")
  public ResponseEntity<Problem> update(@PathVariable("id") Long id, @RequestBody Problem problemDetails) {
    return problemRepository.findById(id).map(problem -> {
      problem.setTitle(problemDetails.getTitle());
      problem.setDescription(problemDetails.getDescription());
      problem.setDifficulty(problemDetails.getDifficulty());
      problem.setBaseCode(problemDetails.getBaseCode());
      problem.setExpectedOutput(problemDetails.getExpectedOutput());
      return ResponseEntity.ok(problemRepository.save(problem));
    }).orElse(ResponseEntity.notFound().build());
  }

  // 문제 삭제
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
    if (problemRepository.existsById(id)) {
      problemRepository.deleteById(id);
      return ResponseEntity.ok().build();
    }
    return ResponseEntity.notFound().build();
  }

  // 코드 실행 (단순 실행)
  @PostMapping("/{id}/run")
  public ResponseEntity<ExecutionResponse> runCode(@PathVariable("id") Long id,
      @RequestBody ExecutionRequest request) {
    ExecutionResponse response = codeExecutor.run(request);
    return ResponseEntity.ok(response);
  }

  // 코드 제출 및 채점
  @PostMapping("/{id}/submit")
  public ResponseEntity<GradingResult> submitCode(@PathVariable("id") Long id,
      @RequestBody ExecutionRequest request) {
    // 1. 문제 조회
    Problem problem = problemRepository.findById(id).orElseThrow(() -> new RuntimeException("문제를 찾을 수 없습니다."));

    long totalTime = 0;
    String status = "FAIL";
    int totalCases = 1;
    int passedCases = 0;
    String message = "";

    // 2. 코드 실행
    ExecutionResponse res = codeExecutor.run(request);
    totalTime = res.getExecutionTime();

    // 3. 상태 결정 (PASS, FAIL, ERROR)
    if (res.getError() != null && !res.getError().isEmpty()) {
      status = "ERROR";
      message = "실행 중 에러: " + res.getError();
    } else {
      String actual = res.getOutput() != null ? res.getOutput().trim() : "";
      String expected = problem.getExpectedOutput() != null ? problem.getExpectedOutput().trim() : "";

      if (!expected.isEmpty() && actual.equals(expected)) {
        status = "PASS";
        passedCases = 1;
        message = "정답입니다!";
      } else {
        status = "FAIL";
        message = "오답입니다.\n[예상]\n" + expected + "\n[실행결과]\n" + actual;
      }
    }

    // 4. 제출 이력 저장 (회원일 경우에만)
    if (request.getUserId() != null) {
      log.info("Saving submission for User ID: {}, Status: {}", request.getUserId(), status);
      final long finalTotalTime = totalTime;
      final String finalStatus = status;
      try {
        usersRepository.findById(request.getUserId()).ifPresent(user -> {
          submissionService.create(user, problem, request.getCode(),
              finalStatus, finalTotalTime);
          log.info("Submission saved successfully.");
        });
      } catch (Exception e) {
        log.error("제출 이력 저장 실패", e);
      }
    }

    return ResponseEntity.ok(GradingResult.builder()
        .status(status)
        .totalCases(totalCases)
        .passedCases(passedCases)
        .message(message)
        .executionTime(totalTime)
        .build());
  }

  // 특정 문제의 제출 기록 전체 조회 (관리자용)
  @GetMapping("/{id}/submissions")
  public ResponseEntity<?> getSubmissions(@PathVariable("id") Long id) {
    try {
      Problem problem = problemRepository.findById(id)
          .orElseThrow(() -> new RuntimeException("문제를 찾을 수 없습니다."));

      List<com.mysite.clover.Submission.Submission> submissions = submissionService.findByProblem(problem);

      // 순환 참조 방지 및 필요한 데이터만 Map으로 추출
      List<Map<String, Object>> result = submissions.stream().map(s -> {
        Map<String, Object> map = new HashMap<>();
        if (s.getUsers() != null) {
          map.put("userId", s.getUsers().getUserId());
          map.put("loginId", s.getUsers().getLoginId());
        }
        map.put("createdAt", s.getCreatedAt());
        map.put("status", s.getStatus());
        map.put("code", s.getCode());
        return map;
      }).collect(Collectors.toList());

      return ResponseEntity.ok(result);
    } catch (Exception e) {
      log.error("제출 기록 조회 중 서버 오류 발생", e);
      return ResponseEntity.status(500).body("제출 기록 조회 중 서버 오류 발생: " + e.getMessage());
    }
  }
}
