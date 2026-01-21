package com.mysite.clover.Problem;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("/api/problems")
@RestController
public class ProblemController {

  private final ProblemRepository problemRepository;

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

  private final CodeExecutor codeExecutor;

  // 문제 등록 (관리자/강사 용)
  @PostMapping
  public Problem create(@RequestBody Problem problem) {
    return problemRepository.save(problem);
  }

  // 코드 실행 (단순 실행)
  // url.md: /student/practice/{problemId}/run -> /api/problems/{id}/run
  @PostMapping("/{id}/run")
  public ResponseEntity<ExecutionResponse> runCode(@PathVariable("id") Long id,
      @RequestBody ExecutionRequest request) {
    // 1. 문제 존재 여부 확인 (옵션) - 현재는 단순 실행이라 문제 정보가 필수는 아님
    // 하지만 "이 문제의 코드"라는 문맥이 있으므로 향후에 문제별 제한시간 등을 적용할 수 있음.

    // 2. 코드 실행 위임
    ExecutionResponse response = codeExecutor.run(request);

    return ResponseEntity.ok(response);
  }
}
