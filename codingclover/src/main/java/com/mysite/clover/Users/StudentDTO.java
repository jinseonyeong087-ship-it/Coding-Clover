package com.mysite.clover.Users;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 관리자가 학생 관리에서 사용할 DTO
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {

    private Long userId;
    private String name;
    private String email;
    private String loginId;
    private String role;
    private String status; // Users status
    private String educationLevel; // StudentProfile 정보
    private String interestCategory; // StudentProfile 정보
    private Integer totalEnrollments; // 총 수강 신청 수
    private LocalDateTime createdAt; // 가입일
    private LocalDateTime updatedAt; 
    private LocalDateTime lastActiveAt; // 최근 활동일
}