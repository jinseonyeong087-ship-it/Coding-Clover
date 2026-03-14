package com.mysite.clover.Submission;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubmissionResponse {
  private Long id;
  private Long problemId;
  private String problemTitle;
  private String status; // PASS, FAIL
  private Long executionTime;
  private String code;
  private LocalDateTime createdAt;
}
