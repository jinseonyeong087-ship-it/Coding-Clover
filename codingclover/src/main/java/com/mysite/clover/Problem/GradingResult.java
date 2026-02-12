package com.mysite.clover.Problem;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GradingResult {
  private String status; // 전체 통과 여부 (PASS, FAIL)
  private int totalCases; // 총 테스트 케이스 수
  private int passedCases; // 통과한 케이스 수
  private String message; // 실패 시 메시지 (예: "3번째 케이스에서 오답")
  private Long executionTime; // 총 소요 시간
}
