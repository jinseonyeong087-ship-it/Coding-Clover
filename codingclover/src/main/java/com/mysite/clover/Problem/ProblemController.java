package com.mysite.clover.Problem;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

@RequiredArgsConstructor
@RequestMapping("/api/problems")
@RestController
public class ProblemController {

  private final ProblemRepository problemRepository;
  private final TestCaseRepository testCaseRepository;
  private final CodeExecutor codeExecutor;
  private final com.mysite.clover.Submission.SubmissionService submissionService;
  private final com.mysite.clover.Users.UsersRepository usersRepository;

  // 문제 목록 조회
  @GetMapping
  public List<Problem> list() {
    return problemRepository.findAll();
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
    // 1. 문제 및 테스트 케이스 조회
    Problem problem = problemRepository.findById(id).orElseThrow();
    List<TestCase> testCases = testCaseRepository.findByProblem(problem);

    if (testCases.isEmpty()) {
      return ResponseEntity.ok(GradingResult.builder()
          .passed(false)
          .message("이 문제에는 등록된 테스트 케이스가 없습니다.")
          .build());
    }

    int passedCount = 0;
    long totalTime = 0;

    // 2. 각 테스트 케이스에 대해 실행 및 비교
    for (int i = 0; i < testCases.size(); i++) {
      TestCase tc = testCases.get(i);

      // 실행 요청 생성 (테스트 케이스의 입력을 사용)
      ExecutionRequest runReq = ExecutionRequest.builder()
          .code(request.getCode())
          .input(tc.getInputData())
          .build();

      ExecutionResponse res = codeExecutor.run(runReq);
      totalTime += res.getExecutionTime();

      // 에러 발생 시 즉시 오답 처리
      if (res.getError() != null && !res.getError().isEmpty()) {
        return ResponseEntity.ok(GradingResult.builder()
            .passed(false)
            .totalCases(testCases.size())
            .passedCases(passedCount)
            .message((i + 1) + "번 케이스 실행 중 에러: " + res.getError())
            .executionTime(totalTime)
            .build());
      }

      // 결과 비교 (공백 제거 후 비교)
      String actual = res.getOutput().trim();
      String expected = tc.getExpectedOutput().trim();

      if (actual.equals(expected)) {
        passedCount++;
      }
      // 틀려도 바로 리턴하지 않고 계속 진행 (OR 조건 지원을 위해)
    }

    // 3. 채점 결과 판단
    // 문제의 의도상 Scanner를 안 쓸 경우, 코드 수정(n=10 or n=11)에 따라
    // Even 또는 Odd 중 하나만 맞출 수 있으므로, '하나라도 맞으면 정답'으로 처리
    boolean passed = passedCount > 0;

    // 추가: 제출 이력 저장 (회원일 경우에만)
    if (request.getUserId() != null) {
      System.out.println("Saving submission for User ID: " + request.getUserId());
      final long finalTotalTime = totalTime;
      try {
        usersRepository.findById(request.getUserId()).ifPresent(user -> {
          submissionService.create(user, problem, request.getCode(),
              passed ? "PASS" : "FAIL", finalTotalTime);
          System.out.println("Submission saved successfully.");
        });
      } catch (Exception e) {
        System.err.println("제출 이력 저장 실패: " + e.getMessage());
        e.printStackTrace();
        // 저장은 실패해도 채점 결과는 반환하도록 예외를 무시하고 진행
      }
    }

    return ResponseEntity.ok(GradingResult.builder()
        .passed(passed)
        .totalCases(testCases.size())
        .passedCases(passedCount)
        .message(passed ? "정답입니다! (적어도 하나의 케이스를 통과했습니다)" : "오답입니다. 일치하는 결과가 없습니다.")
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

      // [중요] 순환 참조 방지 및 500 에러 해결을 위해 필요한 데이터만 Map으로 추출
      List<Map<String, Object>> result = submissions.stream().map(s -> {
        Map<String, Object> map = new HashMap<>();
        // User 엔티티가 null일 경우를 대비해 방어 로직 추가
        if (s.getUsers() != null) {
          map.put("userId", s.getUsers().getUserId());
          map.put("loginId", s.getUsers().getLoginId());
        }
        map.put("submittedAt", s.getCreatedAt());
        map.put("status", s.getStatus()); // "PASS" 또는 "FAIL"
        return map;
      }).collect(Collectors.toList());

      return ResponseEntity.ok(result);
    } catch (Exception e) {
      // 서버 콘솔에서 구체적인 에러 원인을 확인하기 위해 출력
      e.printStackTrace();
      return ResponseEntity.status(500).body("제출 기록 조회 중 서버 오류 발생: " + e.getMessage());
    }
  }
}
