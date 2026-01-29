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
            
            // 파일 경로 처리 로직 개선
            if (Paths.get(filePath).isAbsolute()) {
                // 절대 경로인 경우 그대로 사용
                path = Paths.get(filePath);
            } else if (filePath.contains("/") || filePath.contains("\\")) {
                // 상대 경로인 경우 프로젝트 업로드 폴더와 결합
                path = Paths.get("uploads", filePath).toAbsolutePath();
            } else {
                // 파일명만 있는 경우 프로젝트 업로드 폴더에서 찾기
                path = Paths.get("uploads", filePath).toAbsolutePath();
            }
            
            System.out.println("Looking for file at: " + path.toAbsolutePath());
            
            File file = path.toFile();
            
            if (!file.exists()) {
                System.out.println("File not found: " + path.toAbsolutePath());
                // 파일이 없으면 다른 경로들도 시도
                if (!path.isAbsolute()) {
                    // 현재 작업 디렉토리에서도 찾아보기
                    Path alternativePath = Paths.get(filePath);
                    if (alternativePath.toFile().exists()) {
                        file = alternativePath.toFile();
                        path = alternativePath;
                    } else {
                        return ResponseEntity.notFound().build();
                    }
                } else {
                    return ResponseEntity.notFound().build();
                }
            }
            
            Resource resource = new FileSystemResource(file);
            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/pdf"; // PDF로 기본값 설정
            }
            
            String fileName = file.getName();
            if (!fileName.toLowerCase().endsWith(".pdf")) {
                fileName += ".pdf";
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 어드민 - 파일 경로 수정 (전체 경로를 파일명으로 변경)
    @PostMapping("/admin/fix-file-paths")
    public ResponseEntity<Map<String, String>> fixFilePaths() {
        try {
            instructorProfileService.fixFilePathsToFileNames();
            Map<String, String> response = Map.of("message", "파일 경로 수정 완료");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = Map.of("message", "파일 경로 수정 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}

