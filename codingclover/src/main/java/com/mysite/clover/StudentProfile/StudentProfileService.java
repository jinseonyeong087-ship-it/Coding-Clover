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

    // loginId 기반 조회 (컨트롤러용)
    @Transactional(readOnly = true)
    public StudentProfileDto getStudentProfileByLoginId(String loginId) {

        Users user = usersRepository.findByLoginId(loginId)
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        return getStudentProfile(user.getUserId());
    }

    // userId 조회 (userId 기준으로 Users + StudentProfile 조회)
    @Transactional(readOnly = true)
    public StudentProfileDto getStudentProfile(Long userId) {

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        StudentProfile profile = studentProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("수강생 정보가 없습니다."));
        //반환 DTO 구성
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

    // loginId 기반 수정 (컨트롤러용)
    public void updateStudentProfileByLoginId(String loginId, Map<String, String> requestData) {

        Users user = usersRepository.findByLoginId(loginId)
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        updateStudentProfile(user.getUserId(), requestData);
    }

    // userId 기반 수정 (userId 기준으로 Users + StudentProfile 동시 수정)
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

    // 관심분야 문자열 정제(데이터 일관성 유지 목적)
    private String cleanInterestCategory(String raw) {

        String cleaned = raw.trim();

        if (cleaned.contains("미설정")) {
            cleaned = cleaned.replaceAll("미설정,?\\s*|,\\s*미설정", "").trim();
            cleaned = cleaned.replaceAll("^,\\s*|,\\s*$", "").trim();
        }

        return cleaned.isEmpty() ? "미설정" : cleaned;
    }
}

//Users와 StudentProfile을 동시에 수정·생성하기 때문에 트랜잭션이 없으면 데이터 불일치가 발생할 수 있음
//loginId / userId 진입 메서드는 분리하고 실제 로직은 userId 기준으로 통합
//Users + StudentProfile 결합 책임을 Service가 담당