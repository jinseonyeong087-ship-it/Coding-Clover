package com.mysite.clover.InstructorProfile;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InstructorProfileDto {
  
  private Long userId;
  private String loginId;
  private String bio;
  private Integer careerYears;
  private InstructorStatus status;
  private LocalDateTime appliedAt;
  private LocalDateTime approvedAt;
}
