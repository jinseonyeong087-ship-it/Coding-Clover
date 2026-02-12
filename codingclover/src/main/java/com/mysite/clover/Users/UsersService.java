package com.mysite.clover.Users;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

import com.mysite.clover.InstructorProfile.InstructorProfileRepository;
import com.mysite.clover.InstructorProfile.InstructorStatus;
import com.mysite.clover.StudentProfile.StudentProfile;
import com.mysite.clover.StudentProfile.StudentProfileRepository;
import com.mysite.clover.Enrollment.EnrollmentRepository;

import jakarta.persistence.EntityNotFoundException;

@RequiredArgsConstructor
@Service
public class UsersService {
    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final InstructorProfileRepository instructorProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final EnrollmentRepository enrollmentRepository;

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
            // 프로필 상태 조회
            String pStatus = null;
            var profileOpt = instructorProfileRepository.findById(user.getUserId());
            if (profileOpt.isPresent()) {
                pStatus = profileOpt.get().getStatus().name();
            }

            return new InstructorDTO(
                    user.getUserId(),
                    user.getName(),
                    user.getEmail(),
                    user.getLoginId(),
                    user.getRole().name(),
                    user.getStatus().name(),
                    pStatus, // profileStatus 채우기
                    null, // careerYears
                    null, // bio
                    null, // resumeFilePath
                    user.getCreatedAt(),
                    user.getUpdatedAt(),
                    null, // appliedAt
                    null, // approvedAt
                    null // rejectReason
            );
        }).collect(Collectors.toList());
    }

    public InstructorDTO getInstructorDetail(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        InstructorDTO dto = new InstructorDTO();
        // 기본 정보 (프로필 없을 때)
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
                null, null, null);

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
                    p.getApprovedAt(),
                    p.getRejectReason()); // 반려 사유 추가
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

    // 강사 반려 처리
    public void rejectInstructor(Long userId, String reason) {
        // InstructorProfile 상태만 REJECTED로 변경 (로그인은 여전히 안됨 - SUSPENDED 상태 유지)
        instructorProfileRepository.findById(userId).ifPresent(profile -> {
            profile.setStatus(InstructorStatus.REJECTED);
            profile.setRejectReason(reason);
            instructorProfileRepository.save(profile);
        });
    }

    // 강사 삭제 (강사 프로필 및 계정 삭제)
    @Transactional
    public void deleteInstructor(Long userId) {
        // 1. 유저 조회
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        // 2. 강사 프로필 삭제
        instructorProfileRepository.deleteById(userId);

        // 3. 사용자 계정 삭제
        usersRepository.delete(user);
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

    // 사용자 계정 삭제 (탈퇴)
    @Transactional
    public void deleteUser(String identifier) {
        // 사용자 조회 (loginId 또는 email)
        Users user = usersRepository.findByLoginId(identifier)
                .or(() -> usersRepository.findByEmail(identifier))
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));
        
        Long userId = user.getUserId();
        
        // 1. 관련 프로필 데이터 삭제 (외래키 제약 조건 때문에 먼저 삭제)
        // StudentProfile 삭제
        studentProfileRepository.deleteByUserId(userId);
        
        // InstructorProfile 삭제 (강사인 경우)
        instructorProfileRepository.deleteByUserId(userId);
        
        // 2. TODO: 필요에 따라 다른 관련 테이블의 데이터도 삭제
        // - 수강 정보 (Enrollment)
        // - 포인트/지갑 정보 (UserWallet) 
        // - 결제 내역 (Payment)
        // - 강의 진도 (LectureProgress)
        // - 알림 (Notification)
        // - 커뮤니티 게시글/댓글 등
        
        // 3. Users 테이블에서 사용자 삭제 (마지막에 삭제)
        usersRepository.delete(user);
        
        System.out.println("사용자 계정 삭제 완료: " + identifier);
    }

    // 관리자 - 학생 목록 페이지네이션 (한 페이지 10명, 검색 지원)
    public Page<StudentDTO> getStudentListPaged(int page, String keyword) {
        Pageable pageable = PageRequest.of(page, 15);

        Page<Users> studentsPage;
        if (keyword == null || keyword.trim().isEmpty()) {
            studentsPage = usersRepository.findByRole(UsersRole.STUDENT, pageable);
        } else {
            studentsPage = usersRepository.findByRoleAndKeyword(UsersRole.STUDENT, keyword.trim(), pageable);
        }

        return studentsPage.map(user -> {
            String educationLevel = null;
            String interestCategory = null;
            var profileOpt = studentProfileRepository.findById(user.getUserId());
            if (profileOpt.isPresent()) {
                StudentProfile profile = profileOpt.get();
                educationLevel = profile.getEducationLevel();
                interestCategory = profile.getInterestCategory();
            }

            int enrollmentCount = enrollmentRepository.countByUserUserId(user.getUserId());

            java.time.LocalDateTime lastActiveAt = enrollmentRepository
                    .findTopByUserUserIdOrderByEnrolledAtDesc(user.getUserId())
                    .map(enrollment -> enrollment.getEnrolledAt())
                    .orElse(user.getUpdatedAt());

            return new StudentDTO(
                    user.getUserId(),
                    user.getName(),
                    user.getEmail(),
                    user.getLoginId(),
                    user.getRole().name(),
                    user.getStatus().name(),
                    educationLevel,
                    interestCategory,
                    enrollmentCount,
                    user.getCreatedAt(),
                    user.getUpdatedAt(),
                    lastActiveAt);
        });
    }

    // 통계 카드용: 전체 학생 수
    public long getTotalStudentCount() {
        return usersRepository.countByRole(UsersRole.STUDENT);
    }

    // 통계 카드용: 수강 경험이 있는 학생 수
    public long getStudentsWithEnrollmentCount() {
        return usersRepository.countByRoleWithEnrollment(UsersRole.STUDENT);
    }

    // 관리자 - 학생 목록 조회 (기존 전체 조회 - 하위 호환)
    public List<StudentDTO> getStudentList() {
        List<Users> students = usersRepository.findByRole(UsersRole.STUDENT);

        return students.stream().map(user -> {
            // StudentProfile 정보 조회
            String educationLevel = null;
            String interestCategory = null;
            var profileOpt = studentProfileRepository.findById(user.getUserId());
            if (profileOpt.isPresent()) {
                StudentProfile profile = profileOpt.get();
                educationLevel = profile.getEducationLevel();
                interestCategory = profile.getInterestCategory();
            }

            // 수강 신청 수 계산
            int enrollmentCount = enrollmentRepository.countByUserUserId(user.getUserId());

            // 최근 활동일 조회 (수강 신청 중 가장 최근 것)
            java.time.LocalDateTime lastActiveAt = enrollmentRepository.findTopByUserUserIdOrderByEnrolledAtDesc(user.getUserId())
                .map(enrollment -> enrollment.getEnrolledAt())
                .orElse(user.getUpdatedAt()); // 수강 신청이 없으면 계정 수정일

            return new StudentDTO(
                    user.getUserId(),
                    user.getName(),
                    user.getEmail(),
                    user.getLoginId(),
                    user.getRole().name(),
                    user.getStatus().name(),
                    educationLevel,
                    interestCategory,
                    enrollmentCount,
                    user.getCreatedAt(),
                    user.getUpdatedAt(),
                    lastActiveAt
            );
        }).collect(Collectors.toList());
    }

    // 관리자 - 학생 상세 조회
    public StudentDTO getStudentDetail(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("학생을 찾을 수 없습니다."));

        // StudentProfile 정보 조회
        String educationLevel = null;
        String interestCategory = null;
        var profileOpt = studentProfileRepository.findById(userId);
        if (profileOpt.isPresent()) {
            StudentProfile profile = profileOpt.get();
            educationLevel = profile.getEducationLevel();
            interestCategory = profile.getInterestCategory();
        }

        // 수강 신청 수 계산
        int enrollmentCount = enrollmentRepository.countByUserUserId(userId);

        // 최근 활동일 조회
        java.time.LocalDateTime lastActiveAt = enrollmentRepository.findTopByUserUserIdOrderByEnrolledAtDesc(userId)
            .map(enrollment -> enrollment.getEnrolledAt())
            .orElse(user.getUpdatedAt());

        return new StudentDTO(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getLoginId(),
                user.getRole().name(),
                user.getStatus().name(),
                educationLevel,
                interestCategory,
                enrollmentCount,
                user.getCreatedAt(),
                user.getUpdatedAt(),
                lastActiveAt
        );
    }
}
