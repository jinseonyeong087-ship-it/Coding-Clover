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

  // 문제 등록 (관리자/강사 용)
  @PostMapping
  public Problem create(@RequestBody Problem problem) {
    return problemRepository.save(problem);
  }
}
