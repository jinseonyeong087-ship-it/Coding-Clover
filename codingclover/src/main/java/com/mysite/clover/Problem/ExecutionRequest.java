package com.mysite.clover.Problem;

import lombok.Data;

@Data
public class ExecutionRequest {
  private String code; // 실행할 소스 코드
  private String input; // (선택) 실행 시 입력값 (System.in)
}
