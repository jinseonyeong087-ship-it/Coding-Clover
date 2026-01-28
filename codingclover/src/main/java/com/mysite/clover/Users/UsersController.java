package com.mysite.clover.Users;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("/auth")
@Controller
public class UsersController {

    private final UsersService usersService;

    @PostMapping("/register")
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
    public ResponseEntity<List<InstructorDTO>> getInstructor() {
        List<InstructorDTO> instructorList = usersService.getInstructorList();
        return ResponseEntity.ok(instructorList);
    }
}
