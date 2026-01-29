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

        return instructors.stream().map(user -> {
            // 리스트 조회 시에는 프로필 정보는 필요없거나 null로 처리, 혹은 필요한 값만 채움
            // loginId는 추가
            return new InstructorDTO(
                    user.getUserId(),
                    user.getName(),
                    user.getEmail(),
                    user.getLoginId(),
                    user.getRole().name(),
                    user.getStatus().name(),
                    null, // profileStatus
                    null, // careerYears
                    null, // bio
                    null, // resumeFilePath
                    user.getCreatedAt(),
                    user.getUpdatedAt(),
                    null, // appliedAt
                    null // approvedAt
            );
        }).collect(Collectors.toList());
    }

    public InstructorDTO getInstructorDetail(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        InstructorDTO dto = new InstructorDTO();
        // 기본 정보
        dto = new InstructorDTO(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getLoginId(),
                user.getRole().name(),
                user.getStatus().name(),
                null, null, null, null,
                user.getCreatedAt(),
                user.getUpdatedAt(),
                null, null);

        // 프로필 정보 조회 및 병합 (Builder 패턴이 없어서 생성자로 다시 만듦)
        // 실제로는 Setter를 쓰거나 Builder를 쓰는게 좋음.
        // InstructorDTO에 @Setter가 없으므로 생성자 사용

        var profileOpt = instructorProfileRepository.findById(userId);
        if (profileOpt.isPresent()) {
            var p = profileOpt.get();
            dto = new InstructorDTO(
                    user.getUserId(),
                    user.getName(),
                    user.getEmail(),
                    user.getLoginId(),
                    user.getRole().name(),
                    user.getStatus().name(),
                    p.getStatus().name(),
                    p.getCareerYears(),
                    p.getBio(),
                    p.getResumeFilePath(),
                    user.getCreatedAt(),
                    user.getUpdatedAt(),
                    p.getAppliedAt(),
                    p.getApprovedAt());
        }

        return dto;
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

    // 아이디 찾기
    public String findId(String name, String email) {
        Users user = usersRepository.findByNameAndEmail(name, email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return user.getLoginId();
    }

    // 비밀번호 찾기 정보 일치 유무
    public void verifyUserForPassword(String loginId, String name, String email) {
        usersRepository.findByLoginIdAndNameAndEmail(loginId, name, email)
                .orElseThrow(() -> new RuntimeException("입력하신 정보와 일치하는 사용자가 없습니다."));
    }

    // 비밀번호 변경
    public void updatePassword(String loginId, String newPassword) {
        Users user = usersRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        user.setPassword(passwordEncoder.encode(newPassword));
        usersRepository.save(user);
    }
}
