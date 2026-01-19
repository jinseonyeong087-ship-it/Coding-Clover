package com.mysite.clover.AdminProfile;

import javax.swing.Spring;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;


@RequestMapping("/admin")
@Controller
@RequiredArgsConstructor
public class AdminProfileController {
  
  private final AdminProfileService adminProfileService;
  private final UsersRepository usersRepository;

  //Spring Security 인증 여부 확인 (@PreAuthorize)
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/dashboard")
  public String adminDashboard(@AuthenticationPrincipal User principal) {
    // Spring Security 인증 객체에서 로그인 ID 추출
    String loginId = principal.getUsername();
    Users user = usersRepository.findByLoginId(loginId)
            .orElseThrow();

    // admin_profile 기반 관리자 자격 검증 (관리자 아니면 예외 발생)
    adminProfileService.validateAdmin(user.getUserId());
    //관리자만 대시보드 화면 접근 허용
    return "admin/dashboard";
}
  
}
