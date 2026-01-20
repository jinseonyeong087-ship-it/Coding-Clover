package com.mysite.clover.AdminProfile;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminProfileDto {
  private Long userId;
    private String loginId;
    private String department;
}
