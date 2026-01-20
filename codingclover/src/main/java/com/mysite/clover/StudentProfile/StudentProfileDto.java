package com.mysite.clover.StudentProfile;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudentProfileDto {
  
  private Long userID;
  private String loginID;
  private String educationLevel;
  private String interestCategory;
}
