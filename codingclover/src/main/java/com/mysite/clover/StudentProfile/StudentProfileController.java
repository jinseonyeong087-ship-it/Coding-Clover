package com.mysite.clover.StudentProfile;

import java.util.List;
import java.security.Principal;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.Map;

import com.mysite.clover.Course.Course;
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
    public StudentProfileDto getStudentProfile(Principal principal) {
        String loginId = principal.getName();
        System.out.println("마이페이지 요청 - loginId: " + loginId);
        
        try {
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
            @RequestBody Map<String, String> requestData,
            Principal principal) {
        
        String loginId = principal.getName();
        studentProfileService.updateStudentProfileByLoginId(loginId, requestData);

        return ResponseEntity.ok("프로필 업데이트 성공");
    }

    // 학생 계정 탈퇴
    @DeleteMapping("/withdraw")
    public ResponseEntity<String> withdrawStudent(Principal principal) {
        
        try {
            String loginId = principal.getName();
            System.out.println("탈퇴 요청 - loginId: " + loginId);
            
            usersService.deleteUser(loginId);
            
            System.out.println("탈퇴 처리 완료: " + loginId);
            return ResponseEntity.ok("계정이 성공적으로 탈퇴되었습니다.");
            
        } catch (Exception e) {
            System.err.println("탈퇴 처리 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("탈퇴 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 추천 강좌 목록 조회
    @GetMapping("/recommended-courses")
    public ResponseEntity<List<Course>> getRecommendedCourses(Principal principal) {
        
        try {
            String loginId = principal.getName();
            System.out.println("추천 강좌 요청 - loginId: " + loginId);
            
            List<Course> recommendedCourses = studentProfileService.getRecommendedCourses(loginId);
            System.out.println("추천 강좌 조회 성공: " + recommendedCourses.size() + "개");
            
            return ResponseEntity.ok(recommendedCourses);
        } catch (Exception e) {
            System.err.println("추천 강좌 조회 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

}

