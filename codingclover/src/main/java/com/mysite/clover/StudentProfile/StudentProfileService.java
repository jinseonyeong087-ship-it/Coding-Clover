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

        System.out.println("getStudentProfileByLoginId 호출됨 - loginId: " + loginId);
        
        Users user = usersRepository.findByLoginId(loginId)
                .orElseThrow(() -> {
                    System.err.println("사용자를 찾을 수 없음: " + loginId);
                    return new EntityNotFoundException("사용자 정보가 없습니다.");
                });

        System.out.println("사용자 발견 - userId: " + user.getUserId() + ", name: " + user.getName());
        
        // StudentProfile이 있으면 가져오고, 없으면 기본값으로 DTO 생성
        StudentProfile profile = studentProfileRepository.findByUserId(user.getUserId()).orElse(null);
        
        String educationLevel = "미설정";
        String interestCategory = "미설정";
        
        if (profile != null) {
            educationLevel = profile.getEducationLevel() != null ? profile.getEducationLevel() : "미설정";
            interestCategory = profile.getInterestCategory() != null ? profile.getInterestCategory() : "미설정";
            System.out.println("기존 StudentProfile 발견 - educationLevel: " + educationLevel);
        } else {
            System.out.println("StudentProfile 없음 - 기본값 사용");
        }
        
        return new StudentProfileDto(
                user.getUserId(),
                user.getLoginId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt(),
                educationLevel,
                interestCategory
        );
    }

    // userId 조회 (userId 기준으로 Users + StudentProfile 조회)
    @Transactional
    public StudentProfileDto getStudentProfile(Long userId) {

        System.out.println("getStudentProfile 호출됨 - userId: " + userId);
        
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));

        StudentProfile profile = studentProfileRepository
                .findByUserId(userId)
                .orElseGet(() -> {
                    System.out.println("StudentProfile이 없어서 새로 생성 - userId: " + userId);
                    // 프로필이 없으면 기본 프로필 생성
                    StudentProfile newProfile = new StudentProfile(userId);
                    newProfile.setUser(user);
                    newProfile.setEducationLevel("미설정");
                    newProfile.setInterestCategory("미설정");
                    StudentProfile saved = studentProfileRepository.save(newProfile);
                    System.out.println("새 StudentProfile 생성 완료 - userId: " + userId);
                    return saved;
                });
                
        System.out.println("프로필 조회 완료 - educationLevel: " + profile.getEducationLevel());
                
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
        
        // 새로 생성된 경우 User와 연결
        if (profile.getUser() == null) {
            profile.setUser(user);
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
}

//Users와 StudentProfile을 동시에 수정·생성하기 때문에 트랜잭션이 없으면 데이터 불일치가 발생할 수 있음
//loginId / userId 진입 메서드는 분리하고 실제 로직은 userId 기준으로 통합
//Users + StudentProfile 결합 책임을 Service가 담당