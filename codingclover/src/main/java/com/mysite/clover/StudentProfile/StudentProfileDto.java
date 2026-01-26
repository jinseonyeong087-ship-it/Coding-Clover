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

//화면 전용 데이터 전송 객체(DTO)
//두 엔티티를 하나로 묶는 중간 객체