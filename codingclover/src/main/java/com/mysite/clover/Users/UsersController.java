package com.mysite.clover.Users;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.authentication.AnonymousAuthenticationToken;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Controller
public class UsersController {

    private final UsersService usersService;

    @PostMapping("auth/register")
    @ResponseBody // JSON 본문 응답을 위해 필수
    public ResponseEntity<?> signup(@RequestBody Map<String, String> userMap) {

        String password = userMap.get("password");
        String passwordConfirm = userMap.get("passwordConfirm");

        if (password != null && !password.equals(passwordConfirm)) {
            Map<String, String> errors = new HashMap<>();
            errors.put("passwordConfirm", "비밀번호가 일치하지 않습니다.");
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            usersService.create(
                    userMap.get("loginId"),
                    password,
                    userMap.get("name"),
                    userMap.get("email"),
                    userMap.get("role"));
        } catch (DataIntegrityViolationException e) {
            e.printStackTrace();
            Map<String, String> errors = new HashMap<>();
            errors.put("loginId", "이미 등록된 사용자 ID 또는 이메일입니다.");
            return ResponseEntity.badRequest().body(errors);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errors = new HashMap<>();
            errors.put("global", "회원가입 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(errors);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "회원가입이 완료되었습니다.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/users/instructors")
    @ResponseBody
    public ResponseEntity<List<InstructorDTO>> getInstructor() {
        List<InstructorDTO> instructorList = usersService.getInstructorList();
        return ResponseEntity.ok(instructorList);
    }

    // 관리자: 강사 승인
    @PostMapping("/admin/users/instructors/{userId}/approve")
    @ResponseBody
    public ResponseEntity<String> approveInstructor(@org.springframework.web.bind.annotation.PathVariable Long userId) {
        usersService.approveInstructor(userId);
        return ResponseEntity.ok("강사 승인이 완료되었습니다.");
    }

    // 소셜 로그인을 하면 react에서 로그인을 한게 아니기에 쿠키나 react가 로그인된거지 모름 그래서
    // 로그인 상태를 확인하기 위해 추가함
    @GetMapping("/auth/status")
    @ResponseBody
    public ResponseEntity<?> getStatus(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.ok(Map.of("loggedIn", false));
        }

        Users user = null;
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
            OAuth2User oauth2User = token.getPrincipal(); // google, naver, kakao
            String email = oauth2User.getAttribute("email");
            user = usersService.getUserByEmail(email);
        } else {
            // General login
            user = usersService.getUserByLoginId(authentication.getName());
        }

        if (user != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("loggedIn", true);

            Map<String, Object> userData = new HashMap<>();
            userData.put("role", user.getRole());
            userData.put("name", user.getName());
            userData.put("email", user.getEmail());
            userData.put("loginId", user.getLoginId());

            response.put("user", userData);

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok(Map.of("loggedIn", false));
    }
}
