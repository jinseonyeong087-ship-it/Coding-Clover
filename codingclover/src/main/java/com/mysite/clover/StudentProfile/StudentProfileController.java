package com.mysite.clover.StudentProfile;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

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

  // 수강생 프로필 정보 수정
  @PreAuthorize("isAuthenticated()")
  @PutMapping("/mypage")
  public ResponseEntity<String> updateStudentProfile(
      @AuthenticationPrincipal User principal,
      @RequestBody StudentProfileDto updateDto) {
    try {
      // 로그인 ID 추출
      String loginId = principal.getUsername();

      // Users 조회
      Users user = usersRepository.findByLoginId(loginId)
          .orElseThrow(() -> new EntityNotFoundException("사용자 정보 없음"));

      studentProfileService.updateStudentProfile(user.getUserId(), updateDto);
      return ResponseEntity.ok("프로필이 업데이트되었습니다.");
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }
}
