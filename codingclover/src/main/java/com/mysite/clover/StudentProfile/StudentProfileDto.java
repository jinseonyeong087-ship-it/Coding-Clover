package com.mysite.clover.StudentProfile;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudentProfileDto {
  
  private Long userId;
  private String loginId;
  private String name;
  private String email;
  private LocalDateTime joinDate;
  private String educationLevel;
  private String interestCategory;
}
