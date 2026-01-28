package com.mysite.clover.Users;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class UsersService {
    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

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
    }
}
