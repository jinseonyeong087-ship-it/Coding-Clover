package com.mysite.clover.Users;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 관리자가 강사관리 탭에서 사용할 것들
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class InstructorDTO {

  private Long userId;
  private String name;
  private String email;
  private String role;
  private String status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
