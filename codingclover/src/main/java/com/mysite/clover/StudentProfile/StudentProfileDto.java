package com.mysite.clover.StudentProfile;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudentProfileDto {
  
  private Long userId;
  private String loginId;
  private String educationLevel;
  private String interestCategory;
}
