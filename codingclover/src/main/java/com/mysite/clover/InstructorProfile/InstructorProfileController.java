package com.mysite.clover.InstructorProfile;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@RequestMapping("/api/instructor")
@RestController
@RequiredArgsConstructor
public class InstructorProfileController {
  
    private final InstructorProfileService instructorProfileService;

    // 강사 프로필 조회
    @GetMapping("/mypage")
    public ResponseEntity<InstructorProfileDto> getInstructorProfile(
            @RequestHeader("X-Login-Id") String loginId) {
        
        InstructorProfileDto profile = instructorProfileService.getInstructorProfileByLoginId(loginId);
        return ResponseEntity.ok(profile);
    }
    
    // 강사 프로필 신청/수정
    @PostMapping("/mypage")
    public ResponseEntity<String> submitInstructorProfile(
            @RequestHeader("X-Login-Id") String loginId,
            @RequestParam Map<String, String> requestData,
            @RequestParam(value = "resumeFile", required = false) MultipartFile resumeFile) {
        
        try {
            instructorProfileService.submitInstructorProfile(loginId, requestData, resumeFile);
            return ResponseEntity.ok("강사 신청이 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("신청 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}

