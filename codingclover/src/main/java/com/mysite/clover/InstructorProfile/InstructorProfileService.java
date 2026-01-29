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
                String originalFilename = resumeFile.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                // 파일명 생성 (다운로드 시 사용)
                String fileName = "resume_" + loginId + "_" + System.currentTimeMillis() + extension;

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

    // 이력서 파일 저장 (더 이상 사용하지 않음 - DB 저장 방식 전환)
    private String saveResumeFile(MultipartFile file, String loginId) {
        return null;
    }

    // 강사 승인 처리 (어드민용)
    public void approveInstructor(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        InstructorProfile profile = instructorProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("강사 프로필이 없습니다."));

        profile.setStatus(InstructorStatus.APPROVED);
        profile.setApprovedAt(LocalDateTime.now());
        instructorProfileRepository.save(profile);

        // Users 상태를 활성화로 변경
        user.setStatus(UsersStatus.ACTIVE);
        usersRepository.save(user);
    }

    // 강사 거절 처리 (어드민용)
    public void rejectInstructor(Long userId, String reason) {
        InstructorProfile profile = instructorProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("강사 프로필이 없습니다."));

        profile.setStatus(InstructorStatus.REJECTED);
        instructorProfileRepository.save(profile);
    }

    // 기존 파일 경로를 파일명으로 수정하는 메소드
    @Transactional
    public void fixFilePathsToFileNames() {
        List<InstructorProfile> profiles = instructorProfileRepository.findAll();
        for (InstructorProfile profile : profiles) {
            String filePath = profile.getResumeFilePath();
            if (filePath != null && (filePath.contains("/") || filePath.contains("\\"))) {
                // 전체 경로에서 파일명만 추출
                String fileName = Paths.get(filePath).getFileName().toString();
                profile.setResumeFilePath(fileName);
                instructorProfileRepository.save(profile);
                System.out.println("Updated file path for user " + profile.getUserId() + ": " + fileName);
            }
        }
    }

    // 이력서 파일 다운로드 (DB에서 조회)
    @Transactional(readOnly = true)
    public InstructorProfile getResumeByFilename(String fileName) {
        return instructorProfileRepository.findByResumeFilePath(fileName)
                .orElseThrow(() -> new EntityNotFoundException("파일을 찾을 수 없습니다: " + fileName));
    }
}
