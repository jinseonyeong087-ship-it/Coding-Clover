package com.mysite.clover.Users;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class UsersService {
    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

    public Users create(String loginId, String password, String name, String email) {
        Users user = new Users();
        user.setLoginId(loginId);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setEmail(email);
        user.setRole(UsersRole.STUDENT);
        this.usersRepository.save(user);
        return user;
    }
}
