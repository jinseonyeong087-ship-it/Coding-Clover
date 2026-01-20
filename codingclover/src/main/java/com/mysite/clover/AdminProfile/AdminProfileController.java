package com.mysite.clover.AdminProfile;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

@RequestMapping("/api/admin")
@RestController
@RequiredArgsConstructor
public class AdminProfileController {

  private final AdminProfileService adminProfileService;
  private final UsersRepository usersRepository;

  // Spring Security 인증 여부 확인 (@PreAuthorize)
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/profile")
  public AdminProfileDto getAdminProfile(
      @AuthenticationPrincipal User principal) {
    // 로그인 ID 추출
    String loginId = principal.getUsername();

    // Users 조회
    Users user = usersRepository.findByLoginId(loginId)
        .orElseThrow(() -> new EntityNotFoundException("사용자 정보 없음"));

    // 관리자 권한 검증 (아니면 예외)
    adminProfileService.validateAdmin(user.getUserId());

    // 관리자 프로필 DTO 반환
    return adminProfileService.getAdminProfile(user.getUserId());
  }
}
