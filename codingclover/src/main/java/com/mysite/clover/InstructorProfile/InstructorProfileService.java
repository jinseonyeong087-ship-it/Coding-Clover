package com.mysite.clover.InstructorProfile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;
import com.mysite.clover.Users.UsersStatus;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class InstructorProfileService {

    private final InstructorProfileRepository instructorProfileRepository;
    private final UsersRepository usersRepository;

    @Value("${file.upload.path:./uploads}")
    private String uploadPath;

    // 강사 프로필 조회 (loginId 기반)
    @Transactional(readOnly = true)
    public InstructorProfileDto getInstructorProfileByLoginId(String loginId) {

        Users user = usersRepository.findByLoginId(loginId)
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        InstructorProfile profile = instructorProfileRepository
                .findByUserId(user.getUserId())
                .orElse(null);

        if (profile == null) {
            // 프로필이 없으면 기본값 반환
            return new InstructorProfileDto(
                    user.getUserId(),
                    user.getLoginId(),
                    user.getName(),
                    user.getEmail(),
                    null, // bio
                    null, // careerYears
                    null, // resumeFilePath
                    null, // status
                    null, // appliedAt
                    null // approvedAt
            );
        }

        return new InstructorProfileDto(
                profile.getUserId(),
                user.getLoginId(),
                user.getName(),
                user.getEmail(),
                profile.getBio(),
                profile.getCareerYears(),
                profile.getResumeFilePath(),
                profile.getStatus(),
                profile.getAppliedAt(),
                profile.getApprovedAt());
    }

    // 강사 프로필 신청/수정
    public void submitInstructorProfile(String loginId, Map<String, String> requestData, MultipartFile resumeFile) {

        Users user = usersRepository.findByLoginId(loginId)
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        InstructorProfile profile = instructorProfileRepository
                .findByUserId(user.getUserId())
                .orElse(null);

        if (profile == null) {
            profile = new InstructorProfile(user.getUserId());
        }

        // 기본 정보 업데이트
        String bio = requestData.get("bio");
        String careerYearsStr = requestData.get("careerYears");

        if (bio != null) {
            profile.setBio(bio.trim());
        }

        if (careerYearsStr != null && !careerYearsStr.isBlank()) {
            try {
                profile.setCareerYears(Integer.parseInt(careerYearsStr.trim()));
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("경력 연차는 숫자여야 합니다.");
            }
        }

        // 파일 업로드 처리 (DB 저장 방식)
        if (resumeFile != null && !resumeFile.isEmpty()) {
            try {
                // 원래 파일명 그대로 사용 (DB에 저장하므로 중복 걱정 없음)
                String fileName = resumeFile.getOriginalFilename();
                if (fileName == null || fileName.isBlank()) {
                    fileName = "resume.pdf"; // 파일명이 없을 경우 기본값
                }

                profile.setResumeFilePath(fileName);
                profile.setResumeFileData(resumeFile.getBytes());
                profile.setResumeContentType(resumeFile.getContentType());

            } catch (IOException e) {
                throw new RuntimeException("파일 데이터 처리 중 오류가 발생했습니다: " + e.getMessage());
            }
        }

        profile.setStatus(InstructorStatus.APPLIED);

        try {
            instructorProfileRepository.save(profile);

            // Users 상태 업데이트 (심사 중으로 변경)
            user.setStatus(UsersStatus.SUSPENDED);
            usersRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("프로필 저장 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 이력서 파일 저장
    private String saveResumeFile(MultipartFile file, String loginId) {
        try {
            // 업로드 디렉토리 생성 (프로젝트 루트의 uploads 폴더)
            Path uploadDir = Paths.get(uploadPath).toAbsolutePath();
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
                System.out.println("Created upload directory: " + uploadDir);
            }
            
            // 파일명 생성 (중복 방지)
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String fileName = "resume_" + loginId + "_" + System.currentTimeMillis() + extension;
            
            Path filePath = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            System.out.println("File saved to: " + filePath.toAbsolutePath());
            return fileName; // 파일명만 저장 (전체 경로 아님)
            
        } catch (IOException e) {
            throw new RuntimeException("파일 저장에 실패했습니다: " + e.getMessage());
        }
    }

    // 강사 승인 처리 (어드민용)
    public boolean approveInstructor(String userId) {
        try {
            InstructorProfile profile = instructorProfileRepository
                    .findByUserId(Long.parseLong(userId))
                    .orElseThrow(() -> new EntityNotFoundException("강사 프로필이 없습니다."));
            
            profile.setStatus(InstructorStatus.APPROVED);
            profile.setApprovedAt(LocalDateTime.now());
            instructorProfileRepository.save(profile);
            
            // Users 상태를 활성화로 변경
            Users user = usersRepository.findById(Long.parseLong(userId))
                    .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));
            user.setStatus(UsersStatus.ACTIVE);
            usersRepository.save(user);
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    // 강사 반료 처리 (어드민용)
    public boolean rejectInstructor(String userId) {
        try {
            InstructorProfile profile = instructorProfileRepository
                    .findByUserId(Long.parseLong(userId))
                    .orElseThrow(() -> new EntityNotFoundException("강사 프로필이 없습니다."));
            
            profile.setStatus(InstructorStatus.REJECTED);
            instructorProfileRepository.save(profile);
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    // 모든 강사 프로필 조회 (어드민용)
    @Transactional(readOnly = true)
    public List<InstructorProfile> getAllInstructorProfiles() {
        return instructorProfileRepository.findAll();
    }
    
    // 특정 강사 프로필 조회 (어드민용)
    @Transactional(readOnly = true)
    public InstructorProfile getInstructorProfileByUserId(String userId) {
        return instructorProfileRepository.findByUserId(Long.parseLong(userId)).orElse(null);
    }

    // 이력서 파일 경로로 프로필 조회
    public InstructorProfile findByResumeFilePath(String filePath) {
        return instructorProfileRepository.findByResumeFilePath(filePath)
                .orElse(null);
    }
}
