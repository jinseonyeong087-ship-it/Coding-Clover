package com.mysite.clover.StudentProfile;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseService;
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
    private final CourseService courseService;

    // loginId 혹은 email 기반 조회 (컨트롤러용)
    @Transactional(readOnly = true)
    public StudentProfileDto getStudentProfileByLoginId(String identifier) {

        Users user = usersRepository.findByLoginId(identifier)
                .or(() -> usersRepository.findByEmail(identifier)) // loginId 없으면 email로 검색
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        // StudentProfile이 있으면 가져오고, 없으면 기본값으로 DTO 생성
        StudentProfile profile = studentProfileRepository.findByUserId(user.getUserId()).orElse(null);

        String educationLevel = "미설정";
        String interestCategory = "미설정";

        if (profile != null) {
            educationLevel = profile.getEducationLevel() != null ? profile.getEducationLevel() : "미설정";
            interestCategory = profile.getInterestCategory() != null ? profile.getInterestCategory() : "미설정";
        }

        return new StudentProfileDto(
                user.getUserId(),
                user.getLoginId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt(),
                educationLevel,
                interestCategory);
    }

    // userId 조회 (userId 기준으로 Users + StudentProfile 조회)
    @Transactional
    public StudentProfileDto getStudentProfile(Long userId) {

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        StudentProfile profile = studentProfileRepository
                .findByUserId(userId)
                .orElseGet(() -> {
                    StudentProfile newProfile = new StudentProfile(userId);
                    newProfile.setUser(user);
                    newProfile.setEducationLevel("미설정");
                    newProfile.setInterestCategory("미설정");
                    return studentProfileRepository.save(newProfile);
                });

        // 반환 DTO 구성
        return new StudentProfileDto(
                user.getUserId(),
                user.getLoginId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt(),
                profile.getEducationLevel(),
                profile.getInterestCategory());
    }

    // loginId 혹은 email 기반 수정 (컨트롤러용)
    public void updateStudentProfileByLoginId(String identifier, Map<String, String> requestData) {

        Users user = usersRepository.findByLoginId(identifier)
                .or(() -> usersRepository.findByEmail(identifier))
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        updateStudentProfile(user.getUserId(), requestData);
    }

    // userId 기반 수정 (userId 기준으로 Users + StudentProfile 동시 수정)
    public void updateStudentProfile(Long userId, Map<String, String> requestData) {

        String name = requestData.get("name");
        String educationLevel = requestData.get("educationLevel");
        String interestCategory = requestData.get("interestCategory");

        // Users 업데이트 (분리해서 처리)
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        if (name != null && !name.isBlank()) {
            user.setName(name.trim());
            usersRepository.save(user); // Users 먼저 저장
        }

        // StudentProfile 처리 (별도 트랜잭션)
        StudentProfile profile = studentProfileRepository
                .findByUserId(userId)
                .orElse(null);

        if (profile == null) {
            profile = new StudentProfile(userId);
        }

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
    
    
     //로그인한 학생의 학습 수준에 따른 추천 강좌 목록 조회
    @Transactional(readOnly = true)
    public List<Course> getRecommendedCourses(String identifier) {
        Users user = usersRepository.findByLoginId(identifier)
                .or(() -> usersRepository.findByEmail(identifier))
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));
        
        StudentProfile profile = studentProfileRepository.findByUserId(user.getUserId()).orElse(null);
        
        String educationLevel = "미설정";
        if (profile != null && profile.getEducationLevel() != null) {
            educationLevel = profile.getEducationLevel();
        }
        
        return courseService.getRecommendedCourses(educationLevel);
    }
}