package com.mysite.clover.StudentProfile;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final UsersRepository usersRepository;

    /* =========================
       조회
    ========================= */

    // loginId 기반 조회 (컨트롤러용)
    @Transactional(readOnly = true)
    public StudentProfileDto getStudentProfileByLoginId(String loginId) {

        Users user = usersRepository.findByLoginId(loginId)
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        return getStudentProfile(user.getUserId());
    }

    // userId 기반 조회 (내부 공용)
    @Transactional(readOnly = true)
    public StudentProfileDto getStudentProfile(Long userId) {

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        StudentProfile profile = studentProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("수강생 정보가 없습니다."));

        return new StudentProfileDto(
                user.getUserId(),
                user.getLoginId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt(),
                profile.getEducationLevel(),
                profile.getInterestCategory()
        );
    }

    /* =========================
       수정
    ========================= */

    // loginId 기반 수정 (컨트롤러용)
    public void updateStudentProfileByLoginId(String loginId, Map<String, String> requestData) {

        Users user = usersRepository.findByLoginId(loginId)
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        updateStudentProfile(user.getUserId(), requestData);
    }

    // userId 기반 수정 (내부 공용)
    public void updateStudentProfile(Long userId, Map<String, String> requestData) {

        String name = requestData.get("name");
        String educationLevel = requestData.get("educationLevel");
        String interestCategory = requestData.get("interestCategory");

        // Users 업데이트
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        if (name != null && !name.isBlank()) {
            user.setName(name.trim());
        }

        // StudentProfile 조회 (없으면 생성)
        StudentProfile profile = studentProfileRepository
                .findByUserId(userId)
                .orElse(new StudentProfile(userId));

        if (educationLevel != null && !educationLevel.isBlank()) {
            profile.setEducationLevel(educationLevel.trim());
        }

        if (interestCategory != null && !interestCategory.isBlank()) {
            profile.setInterestCategory(cleanInterestCategory(interestCategory));
        }

        studentProfileRepository.save(profile);
    }

    /* =========================
       내부 유틸
    ========================= */

    // 관심분야 문자열 정제
    private String cleanInterestCategory(String raw) {

        String cleaned = raw.trim();

        if (cleaned.contains("미설정")) {
            cleaned = cleaned.replaceAll("미설정,?\\s*|,\\s*미설정", "").trim();
            cleaned = cleaned.replaceAll("^,\\s*|,\\s*$", "").trim();
        }

        return cleaned.isEmpty() ? "미설정" : cleaned;
    }
}

