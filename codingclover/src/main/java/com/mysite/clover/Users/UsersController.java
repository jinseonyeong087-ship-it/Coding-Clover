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

    // 강사 상세 조회 (AdminMain 및 AdminApproch에서 사용)
    @GetMapping("/admin/users/instructors/{userId}")
    @ResponseBody
    public ResponseEntity<InstructorDTO> getInstructorDetail(
            @org.springframework.web.bind.annotation.PathVariable Long userId) {
        InstructorDTO instructor = usersService.getInstructorDetail(userId);
        return ResponseEntity.ok(instructor);
    }

    // 강사 이력서 다운로드
    @GetMapping("/admin/users/instructors/{userId}/resume")
    public ResponseEntity<org.springframework.core.io.Resource> downloadInstructorResume(
            @org.springframework.web.bind.annotation.PathVariable Long userId) throws java.io.IOException {
        // 1. 강사 정보 및 프로필 조회 via Service
        InstructorDTO instructor = usersService.getInstructorDetail(userId);
        if (instructor == null || instructor.getResumeFilePath() == null) {
            return ResponseEntity.notFound().build();
        }

        // 2. 파일 경로 구성
        String filename = instructor.getResumeFilePath();
        // InstructorProfileService와 동일한 경로 사용
        String uploadPathStr = System.getProperty("user.home") + "/coding-clover/uploads";
        // 주의: application.properties의 설정과 일치해야 함.
        // 일단 하드코딩된 기본값과 맞춤. 실제로는 Service에서 Path를 받아오는게 좋음.

        java.nio.file.Path path = java.nio.file.Paths.get(uploadPathStr).resolve(filename);

        if (!java.nio.file.Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }

        org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(path.toUri());

        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF) // 혹은
                                                                                 // MediaType.APPLICATION_OCTET_STREAM
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(resource);
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
