package com.mysite.clover.Problem;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExecutionResponse {
  private String output; // 표준 출력 (System.out)
  private String error; // 에러 메시지 (System.err / 컴파일 에러)
  private long executionTime; // 실행 소요 시간 (ms)
}
