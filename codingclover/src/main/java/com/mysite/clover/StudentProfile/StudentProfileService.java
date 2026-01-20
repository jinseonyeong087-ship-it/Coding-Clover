package com.mysite.clover.StudentProfile;

import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentProfileService {
  
  private final StudentProfileRepository studentProfileRepository;

    // 수강생 프로필 조회 (DTO 반환)
    public StudentProfileDto getStudentProfile(Long userId) {

        StudentProfile profile = studentProfileRepository
                .findByUser_UserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("수강생 정보가 없습니다."));

        return new StudentProfileDto(
                profile.getUserId(),
                profile.getUser().getLoginId(),
                profile.getEducationLevel(),
                profile.getInterestCategory()
        );
    } 
}
