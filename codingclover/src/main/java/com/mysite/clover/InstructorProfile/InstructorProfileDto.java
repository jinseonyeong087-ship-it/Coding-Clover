package com.mysite.clover.InstructorProfile;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InstructorProfileDto {

  private Long userId;
  private String loginId;
  private String name;
  private String email;
  private String bio;
  private Integer careerYears;
  private String resumeFilePath;
  private InstructorStatus status;
  private LocalDateTime appliedAt;
  private LocalDateTime approvedAt;
  private String rejectReason;
}
