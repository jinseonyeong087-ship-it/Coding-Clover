package com.mysite.clover.StudentProfile;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/student")
@RestController
@RequiredArgsConstructor
public class StudentProfileController {

  private final StudentProfileService studentProfileService;
  private final UsersRepository usersRepository;

  // Spring Security 인증 여부 확인 (@PreAuthorize)
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/mypage")
  public StudentProfileDto getStudentProfile(
      @AuthenticationPrincipal User principal) {
    // 로그인 ID 추출
    String loginId = principal.getUsername();

    // Users 조회
    Users user = usersRepository.findByLoginId(loginId)
        .orElseThrow(() -> new EntityNotFoundException("사용자 정보 없음"));

    return studentProfileService.getStudentProfile(user.getUserId());

  }
}
