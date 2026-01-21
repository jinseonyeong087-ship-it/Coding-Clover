package com.mysite.clover.InstructorProfile;

import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class InstructorProfileService {
  
  private final InstructorProfileRepository instructorProfileRepository;

    // 강사 프로필 조회 (DTO 반환)
    public InstructorProfileDto getInstructorProfile(Long userId) {

        InstructorProfile profile = instructorProfileRepository
                .findByUser_UserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("강사 정보가 없습니다."));

        return new InstructorProfileDto(
                profile.getUserId(),
                profile.getUser().getLoginId(),
                profile.getBio(),
                profile.getCareerYears(),
                profile.getStatus(),
                profile.getAppliedAt(),
                profile.getApprovedAt()
        );
    }
}
