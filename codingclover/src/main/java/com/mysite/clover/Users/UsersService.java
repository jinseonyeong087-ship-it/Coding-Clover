package com.mysite.clover.Users;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.mysite.clover.StudentProfile.StudentProfile;
import com.mysite.clover.StudentProfile.StudentProfileRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class UsersService {
    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudentProfileRepository studentProfileRepository;

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
        
        // STUDENT 역할인 경우 StudentProfile도 함께 생성
        if (UsersRole.STUDENT.equals(savedUser.getRole())) {
            StudentProfile studentProfile = new StudentProfile(savedUser.getUserId());
            studentProfile.setUser(savedUser);
            studentProfile.setEducationLevel("미설정");
            studentProfile.setInterestCategory("미설정");
            studentProfileRepository.save(studentProfile);
        }

        return savedUser;
    }
}
