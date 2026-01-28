package com.mysite.clover.Users;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

import com.mysite.clover.InstructorProfile.InstructorProfileRepository;
import com.mysite.clover.InstructorProfile.InstructorStatus;

@RequiredArgsConstructor
@Service
public class UsersService {
    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final InstructorProfileRepository instructorProfileRepository;

    public Users create(String loginId, String password, String name, String email, String role) {
        Users user = new Users();
        user.setLoginId(loginId);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setEmail(email);

        // Role 설정 (문자열 role을 Enum으로 변환 및 상태 설정)
        if ("INSTRUCTOR".equals(role)) {
            user.setRole(UsersRole.INSTRUCTOR);
            user.setStatus(UsersStatus.SUSPENDED); // 강사는 승인 대기
        } else if ("ADMIN".equals(role)) {
            user.setRole(UsersRole.ADMIN);
            user.setStatus(UsersStatus.ACTIVE);
        } else {
            user.setRole(UsersRole.STUDENT); // 기본값
            user.setStatus(UsersStatus.ACTIVE);
        }

        // Users 저장
        Users savedUser = this.usersRepository.save(user);
        System.out.println("Users 저장 완료 - userId: " + savedUser.getUserId());

        // StudentProfile은 마이페이지 접근 시 자동 생성되도록 변경
        // (회원가입 시 생성하지 않음으로써 안정성 확보)

        return savedUser;

        // 관리자 - 강사 관리에서 사용
    }

    public List<InstructorDTO> getInstructorList() {
        List<Users> instructors = usersRepository.findByRole(UsersRole.INSTRUCTOR);

        return instructors.stream().map(user -> new InstructorDTO(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getCreatedAt(),
                user.getUpdatedAt())).collect(Collectors.toList());
    }

    // 강사 승인 처리
    public void approveInstructor(Long userId) {
        // 1. 유저 조회
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 2. Users 상태를 ACTIVE로 변경 (로그인 허용)
        user.setStatus(UsersStatus.ACTIVE);
        usersRepository.save(user);

        // 3. InstructorProfile 상태 업데이트 (프로필이 존재할 경우에만)
        instructorProfileRepository.findById(userId).ifPresent(profile -> {
            profile.setStatus(InstructorStatus.APPROVED);
            profile.setApprovedAt(java.time.LocalDateTime.now());
            instructorProfileRepository.save(profile);
        });
    }

    public Users getUserByLoginId(String loginId) {
        return usersRepository.findByLoginId(loginId).orElse(null);
    }

    public Users getUserByEmail(String email) {
        return usersRepository.findByEmail(email).orElse(null);
    }
}
