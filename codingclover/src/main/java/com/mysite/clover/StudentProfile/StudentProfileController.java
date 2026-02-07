package com.mysite.clover.StudentProfile;


import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Map;

import com.mysite.clover.Users.UsersService;

import lombok.RequiredArgsConstructor;

@RequestMapping("/api/student")
@RestController
@RequiredArgsConstructor
public class StudentProfileController {

    //모든 비즈니스 로직은 Service로 위임
    private final StudentProfileService studentProfileService;
    private final UsersService usersService;

    //로그인한 수강생의 마이페이지 정보 조회
    @GetMapping("/mypage")
    public StudentProfileDto getStudentProfile(
            @AuthenticationPrincipal User principal,
            HttpServletRequest request) {
        //1.resolveLoginId()로 loginId 추출
        String loginId = resolveLoginId(principal, request);
        System.out.println("마이페이지 요청 - loginId: " + loginId);
        
        try {
            //2.Service에 loginId 전달 → 마이페이지 DTO 반환
            StudentProfileDto result = studentProfileService.getStudentProfileByLoginId(loginId);
            System.out.println("프로필 조회 성공: " + result.getLoginId());
            return result;
        } catch (Exception e) {
            System.err.println("프로필 조회 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/mypage")
    public ResponseEntity<String> updateStudentProfile(
            //프론트에서 넘어온 수정 요청 데이터, 부분 수정 허용(Map)
            @RequestBody Map<String, String> requestData,
            //현재 로그인 사용자
            @AuthenticationPrincipal User principal,
            HttpServletRequest request) {
        
        //로그인 사용자 식별(컨트롤러의 유일한 책임)
        String loginId = resolveLoginId(principal, request);
        //Service에 수정 요청 위임
        studentProfileService.updateStudentProfileByLoginId(loginId, requestData);

        return ResponseEntity.ok("프로필 업데이트 성공");
    }

    // 학생 계정 탈퇴
    @DeleteMapping("/withdraw")
    public ResponseEntity<String> withdrawStudent(
            @AuthenticationPrincipal User principal,
            HttpServletRequest request) {
        
        try {
            // 로그인 사용자 식별
            String loginId = resolveLoginId(principal, request);
            System.out.println("탈퇴 요청 - loginId: " + loginId);
            
            // UsersService의 deleteUser 메서드를 직접 사용
            usersService.deleteUser(loginId);
            
            System.out.println("탈퇴 처리 완료: " + loginId);
            return ResponseEntity.ok("계정이 성공적으로 탈퇴되었습니다.");
            
        } catch (Exception e) {
            System.err.println("탈퇴 처리 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("탈퇴 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    //resolveLoginId()는 요청으로부터 로그인 사용자를 식별하기 위한 전용 유틸 메서드
    private String resolveLoginId(User principal, HttpServletRequest request) {

        //우선순위: 헤더 > 인증 정보 > 세션
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
