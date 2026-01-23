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
import org.springframework.transaction.annotation.Transactional;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Map;

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
  private final StudentProfileRepository studentProfileRepository;

  // 테스트용 간단한 엔드포인트
  @GetMapping("/test")
  public String test() {
    return "API 연결 성공!";
  }

  // Spring Security 인증 여부 확인 - 실제 로그인 사용자 조회
  // @PreAuthorize("isAuthenticated()")
  @GetMapping("/mypage")
  public StudentProfileDto getStudentProfile(
      @AuthenticationPrincipal User principal,
      HttpServletRequest request) {
    
    System.out.println("=== 마이페이지 API 호출 ===");
    
    try {
      String loginId = null;
      
      // 1. 헤더에서 로그인 ID 추출 (프론트엔드에서 전달)
      String headerLoginId = request.getHeader("X-Login-Id");
      if (headerLoginId != null && !headerLoginId.isEmpty() && !headerLoginId.equals("null")) {
        loginId = headerLoginId;
        System.out.println("✅ 헤더에서 로그인 ID 추출: " + loginId);
      }
      // 2. Principal에서 사용자 정보 추출 시도
      else if (principal != null) {
        loginId = principal.getUsername();
        System.out.println("✅ Principal에서 로그인 ID 추출: " + loginId);
      } 
      // 3. 세션에서 사용자 정보 추출 시도
      else {
        HttpSession session = request.getSession(false);
        if (session != null) {
          String[] possibleKeys = {"loginId", "user", "username", "userId"};
          for (String key : possibleKeys) {
            Object value = session.getAttribute(key);
            if (value != null && loginId == null) {
              loginId = value.toString();
              System.out.println("✅ 세션에서 loginId 추출 (" + key + "): " + loginId);
              break;
            }
          }
        }
      }
      
      // 4. 모두 실패시 기본값 사용
      if (loginId == null || loginId.isEmpty()) {
        loginId = "student";
        System.out.println("⚠️ 기본값 사용: " + loginId);
      }

      // Users 테이블에서 기본 정보 조회
      Users user = usersRepository.findByLoginId(loginId).orElse(null);
      if (user == null) {
        System.out.println("사용자를 찾을 수 없음: " + loginId);
        return new StudentProfileDto(
            null, 
            loginId, 
            "사용자 없음", 
            "notfound@example.com", 
            java.time.LocalDateTime.now(), 
            "미설정", 
            "미설정"
        );
      }
      
      System.out.println("Users 조회 성공: " + user.getName() + " (ID: " + user.getUserId() + ")");
      
      // StudentProfile에서 학습수준과 관심분야 조회
      String educationLevel = "미설정";
      String interestCategory = "미설정";
      
      try {
        StudentProfile profile = studentProfileRepository.findByUserId(user.getUserId()).orElse(null);
        if (profile != null) {
          educationLevel = profile.getEducationLevel() != null ? profile.getEducationLevel() : "미설정";
          interestCategory = profile.getInterestCategory() != null ? profile.getInterestCategory() : "미설정";
          System.out.println("StudentProfile 조회 성공 - 학습수준: " + educationLevel + ", 관심분야: " + interestCategory);
        } else {
          System.out.println("StudentProfile이 없음 - 기본값 사용");
        }
      } catch (Exception e) {
        System.out.println("StudentProfile 조회 실패 - 기본값 사용: " + e.getMessage());
      }
      
      // Users 정보 + StudentProfile 정보 결합
      return new StudentProfileDto(
          user.getUserId(),
          user.getLoginId(),
          user.getName(),
          user.getEmail(),
          user.getCreatedAt(),
          educationLevel,
          interestCategory
      );
      
    } catch (Exception e) {
      System.out.println("전체 오류 발생: " + e.getMessage());
      e.printStackTrace();
      
      return new StudentProfileDto(
          1L, 
          "error", 
          "오류 발생", 
          "error@example.com", 
          java.time.LocalDateTime.now(), 
          "오류", 
          "오류"
      );
    }
  }

  // 수강생 프로필 정보 수정 - 실제 로그인 사용자 기반
  @Transactional
  @PutMapping("/mypage")
  public ResponseEntity<String> updateStudentProfile(
      @RequestBody Map<String, String> requestData,
      @AuthenticationPrincipal User principal,
      HttpServletRequest request) {
    
    System.out.println("=== 프로필 업데이트 API 호출 ===");
    System.out.println("받은 데이터: " + requestData);
    
    try {
      String name = requestData.get("name");
      String educationLevel = requestData.get("educationLevel");
      String interestCategory = requestData.get("interestCategory");
      
      System.out.println("파싱된 데이터 - 이름: " + name + ", 학습수준: " + educationLevel + ", 관심분야: " + interestCategory);
      
      String loginId = null;
      
      // 1. 헤더에서 로그인 ID 추출 (프론트엔드에서 전달)
      String headerLoginId = request.getHeader("X-Login-Id");
      if (headerLoginId != null && !headerLoginId.isEmpty() && !headerLoginId.equals("null")) {
        loginId = headerLoginId;
        System.out.println("✅ 헤더에서 로그인 ID 추출: " + loginId);
      }
      // 2. Principal에서 사용자 정보 추출 시도
      else if (principal != null) {
        loginId = principal.getUsername();
        System.out.println("✅ Principal에서 로그인 ID 추출: " + loginId);
      } 
      // 3. 세션에서 사용자 정보 추출 시도
      else {
        HttpSession session = request.getSession(false);
        if (session != null) {
          Object loginIdFromSession = session.getAttribute("loginId");
          if (loginIdFromSession != null) {
            loginId = loginIdFromSession.toString();
            System.out.println("✅ 세션에서 loginId 추출: " + loginId);
          }
        }
      }
      
      // 4. 모두 실패시 기본값 사용
      if (loginId == null || loginId.isEmpty()) {
        loginId = "student";
        System.out.println("⚠️ 기본값 사용: " + loginId);
      }
      
      // Users 조회
      Users user = usersRepository.findByLoginId(loginId).orElse(null);
      if (user == null) {
        System.out.println("사용자를 찾을 수 없음: " + loginId);
        return ResponseEntity.ok("사용자 정보를 찾을 수 없습니다. loginId: " + loginId);
      }
      
      System.out.println("Users 조회 성공: " + user.getName() + " (ID: " + user.getUserId() + ")");
      
      // 이름 업데이트 (Users 테이블)
      if (name != null && !name.trim().isEmpty()) {
        String oldName = user.getName();
        user.setName(name.trim());
        usersRepository.save(user);
        System.out.println("이름 업데이트: " + oldName + " -> " + user.getName());
      }
      
      // StudentProfile 처리 (교육수준, 관심분야) - 더 안전한 방식
      if (educationLevel != null || interestCategory != null) {
        // 기존 프로필 조회
        StudentProfile profile = studentProfileRepository.findByUserId(user.getUserId()).orElse(null);
        
        if (profile == null) {
          // 새로 생성 - MapsId 없이 간단하게
          profile = new StudentProfile(user.getUserId());
          System.out.println("새 StudentProfile 생성 - userId: " + user.getUserId());
        } else {
          System.out.println("기존 StudentProfile 발견 - userId: " + user.getUserId());
        }
        
        // 값 업데이트
        if (educationLevel != null && !educationLevel.trim().isEmpty()) {
          profile.setEducationLevel(educationLevel.trim());
          System.out.println("교육수준 설정: " + educationLevel);
        }
        
        if (interestCategory != null && !interestCategory.trim().isEmpty()) {
          // "미설정" 값을 제거하고 정리
          String cleanedInterests = interestCategory.trim();
          
          // "미설정" 제거
          if (cleanedInterests.contains("미설정")) {
            cleanedInterests = cleanedInterests.replaceAll("미설정,?\\s*|,\\s*미설정", "").trim();
            // 시작이나 끝에 콤마가 있으면 제거
            cleanedInterests = cleanedInterests.replaceAll("^,\\s*|,\\s*$", "").trim();
          }
          
          // 빈 문자열이면 "미설정"으로 설정
          if (cleanedInterests.isEmpty()) {
            cleanedInterests = "미설정";
          }
          
          profile.setInterestCategory(cleanedInterests);
          System.out.println("관심분야 설정: " + cleanedInterests);
        }
        
        try {
          studentProfileRepository.save(profile);
          System.out.println("StudentProfile 저장 성공");
        } catch (Exception e) {
          System.out.println("StudentProfile 저장 실패: " + e.getMessage());
          return ResponseEntity.ok("기본 정보는 업데이트되었지만 학습 정보 저장에 실패했습니다: " + e.getMessage());
        }
      }
      
      return ResponseEntity.ok("프로필 업데이트 성공: 이름=" + name + ", 학습수준=" + educationLevel + ", 관심분야=" + interestCategory);
      
    } catch (Exception e) {
      System.out.println("오류 발생: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.ok("업데이트 중 오류: " + e.getMessage());
    }
  }
}
