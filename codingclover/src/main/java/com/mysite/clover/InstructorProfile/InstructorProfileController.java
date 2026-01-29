package com.mysite.clover.InstructorProfile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    
    // 이력서 다운로드
    @GetMapping("/download-resume")
    public ResponseEntity<Resource> downloadResume(@RequestParam("filePath") String filePath) {
        try {
            Path path;
            // 파일 경로가 절대 경로가 아닌 경우, 업로드 폴더와 결합
            if (!Paths.get(filePath).isAbsolute()) {
                // 업로드 폴더 경로를 가져와서 결합
                String uploadPath = System.getProperty("user.home") + "/coding-clover/uploads";
                path = Paths.get(uploadPath, filePath);
            } else {
                path = Paths.get(filePath);
            }
            
            File file = path.toFile();
            
            if (!file.exists()) {
                System.out.println("File not found: " + path.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new FileSystemResource(file);
            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}

