package com.mysite.clover.StudentProfile;


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


import lombok.RequiredArgsConstructor;

@RequestMapping("/api/student")
@RestController
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    @GetMapping("/mypage")
    public StudentProfileDto getStudentProfile(
            @AuthenticationPrincipal User principal,
            HttpServletRequest request) {

        String loginId = resolveLoginId(principal, request);
        return studentProfileService.getStudentProfileByLoginId(loginId);
    }

    @PutMapping("/mypage")
    public ResponseEntity<String> updateStudentProfile(
            @RequestBody Map<String, String> requestData,
            @AuthenticationPrincipal User principal,
            HttpServletRequest request) {

        String loginId = resolveLoginId(principal, request);
        studentProfileService.updateStudentProfileByLoginId(loginId, requestData);

        return ResponseEntity.ok("프로필 업데이트 성공");
    }

    // ✅ 로그인 ID 추출 책임만 유지
    private String resolveLoginId(User principal, HttpServletRequest request) {

        String headerLoginId = request.getHeader("X-Login-Id");
        if (headerLoginId != null && !headerLoginId.isBlank() && !"null".equals(headerLoginId)) {
            return headerLoginId;
        }

        if (principal != null) {
            return principal.getUsername();
        }

        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("loginId") != null) {
            return session.getAttribute("loginId").toString();
        }

        throw new IllegalStateException("로그인 정보를 확인할 수 없습니다.");
    }
}
