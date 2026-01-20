package com.mysite.clover.AdminProfile;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProfileService {

    private final AdminProfileRepository adminProfileRepository;

    // 관리자 여부 확인 (true / false)
    public boolean isAdmin(Long userId) {
        return adminProfileRepository.existsByUser_UserId(userId);
    }

    // 관리자 권한 검증 (관리자가 아니면 예외)
    public void validateAdmin(Long userId) {
        if (!isAdmin(userId)) {
            throw new AccessDeniedException("관리자 권한이 없습니다.");
        }
    }

     // ✅ 관리자 프로필 조회 (DTO 반환)
    public AdminProfileDto getAdminProfile(Long userId) {

        AdminProfile profile = adminProfileRepository
                .findByUser_UserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("관리자 정보가 없습니다."));

        return new AdminProfileDto(
                profile.getUserId(),
                profile.getUser().getLoginId(),
                profile.getDepartment()
        );
    }
}


//validateAdmin 관리자가 아니면 예외를 던짐(통과or예외