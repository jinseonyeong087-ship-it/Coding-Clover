package com.mysite.clover.Users;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class UsersService {
    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

    public Users create(String loginId, String password, String nickname, String name, String email, String phone, String birthDate, String gender) {
        Users user = new Users();
        user.setLoginId(loginId);
        user.setPassword(passwordEncoder.encode(password));
        user.setNickname(nickname);
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setBirthDate(birthDate);
        user.setGender(gender);
        user.setRole(UsersRole.STUDENT); // 기본값 설정
        // 필요한 다른 필드 설정
        this.usersRepository.save(user);
        return user;
    }
}
