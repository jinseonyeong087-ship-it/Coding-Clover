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

import com.mysite.clover.Mail.MailService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Controller
public class UsersController {

    private final UsersService usersService;
    private final MailService mailService;

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

    // 관리자: 학생 목록 조회
    @GetMapping("/admin/users/students") 
    @ResponseBody
    public ResponseEntity<List<StudentDTO>> getStudents() {
        List<StudentDTO> studentList = usersService.getStudentList();
        return ResponseEntity.ok(studentList);
    }

    // 관리자: 학생 상세 조회
    @GetMapping("/admin/users/students/{userId}")
    @ResponseBody
    public ResponseEntity<StudentDTO> getStudentDetail(
            @org.springframework.web.bind.annotation.PathVariable("userId") Long userId) {
        StudentDTO student = usersService.getStudentDetail(userId);
        return ResponseEntity.ok(student);
    }

    // 관리자: 강사 승인
    @PostMapping("/admin/users/instructors/{userId}/approve")
    @ResponseBody
    public ResponseEntity<String> approveInstructor(
            @org.springframework.web.bind.annotation.PathVariable("userId") Long userId) {
        usersService.approveInstructor(userId);
        return ResponseEntity.ok("강사 승인이 완료되었습니다.");
    }

    // 관리자: 강사 반려
    @PostMapping("/admin/users/instructors/{userId}/reject")
    @ResponseBody
    public ResponseEntity<String> rejectInstructor(
            @org.springframework.web.bind.annotation.PathVariable("userId") Long userId,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        usersService.rejectInstructor(userId, reason);
        return ResponseEntity.ok("강사 반려가 처리되었습니다.");
    }

    // 관리자: 강사 삭제 (계정 자체 삭제)
    @org.springframework.web.bind.annotation.DeleteMapping("/admin/users/instructors/{userId}/delete")
    @ResponseBody
    public ResponseEntity<String> deleteInstructor(
            @org.springframework.web.bind.annotation.PathVariable("userId") Long userId) {
        usersService.deleteInstructor(userId);
        return ResponseEntity.ok("강사가 성공적으로 삭제되었습니다.");
    }

    // 강사 상세 조회 (AdminMain 및 AdminApproch에서 사용)
    @GetMapping("/admin/users/instructors/{userId}")
    @ResponseBody
    public ResponseEntity<InstructorDTO> getInstructorDetail(
            @org.springframework.web.bind.annotation.PathVariable("userId") Long userId) {
        InstructorDTO instructor = usersService.getInstructorDetail(userId);
        return ResponseEntity.ok(instructor);
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

    @PostMapping("/auth/findRequest")
    @ResponseBody
    public ResponseEntity<?> handleFindRequest(@RequestBody Map<String, String> params, HttpSession session) {
        try {
            String type = params.get("type"); // 프론트에서 'id', 'pw', 'verify', 'reset' 중 하나를 보냄

            // 1. 아이디 찾기
            if ("id".equals(type)) {
                String loginId = usersService.findId(params.get("name"), params.get("email"));
                return ResponseEntity.ok(Map.of("loginId", loginId));
            }

            // 2. 비밀번호 찾기 - 사용자 정보 확인 및 인증번호 발송
            else if ("pw".equals(type)) {
                usersService.verifyUserForPassword(
                        params.get("loginId"),
                        params.get("name"),
                        params.get("email"));
                int number = mailService.sendMail(params.get("email"));
                session.setAttribute("emailAuthNumber", String.valueOf(number)); // 비교를 위해 String으로 저장
                session.setMaxInactiveInterval(300); // 세션 유효 시간 5분 설정 (필요시 조정)
                return ResponseEntity.ok(Map.of("message", "인증번호가 이메일로 발송되었습니다."));
            }

            // 3. 비밀번호 찾기 - 인증번호 검증
            else if ("verify".equals(type)) {
                String inputAuthNum = params.get("authNumber");
                String sessionAuthNum = (String) session.getAttribute("emailAuthNumber");

                if (sessionAuthNum != null && sessionAuthNum.equals(inputAuthNum)) {
                    session.setAttribute("isPwVerified", true); // 인증 성공 플래그
                    return ResponseEntity.ok(Map.of("message", "인증에 성공하였습니다."));
                } else {
                    return ResponseEntity.badRequest().body(Map.of("message", "인증번호가 일치하지 않거나 만료되었습니다."));
                }
            }

            // 4. 비밀번호 재설정(인증 완료 후)
            else if ("reset".equals(type)) {
                // 인증된 세션인지 확인
                Boolean isVerified = (Boolean) session.getAttribute("isPwVerified");
                if (isVerified == null || !isVerified) {
                    return ResponseEntity.badRequest().body(Map.of("message", "본인 인증이 완료되지 않았습니다."));
                }

                String loginId = params.get("loginId");
                String newPassword = params.get("newPassword");

                usersService.updatePassword(loginId, newPassword);

                // 사용된 세션 정보 제거
                session.removeAttribute("emailAuthNumber");
                session.removeAttribute("isPwVerified");

                return ResponseEntity.ok(Map.of("message", "비밀번호가 성공적으로 변경되었습니다."));
            }

            return ResponseEntity.badRequest().body(Map.of("message", "잘못된 요청 타입입니다."));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
