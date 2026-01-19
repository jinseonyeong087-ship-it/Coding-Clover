package com.mysite.clover.Users;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class UsersSecurityService implements UserDetailsService {

  private final UsersRopository usersRepository;

  @Override
  public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
    Optional<Users> _users = this.usersRepository.findByLoginId(loginId);
    if (_users.isEmpty()) {
      throw new UsernameNotFoundException("사용자를 찾을 수 없습니다.");
    }
    Users users = _users.get();
    List<GrantedAuthority> authorities = new ArrayList<>();

    // 역할에 따른 권한 부여
    if (users.getRole() == UsersRole.ADMIN) {
      authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
    } else if (users.getRole() == UsersRole.INSTRUCTOR) {
      authorities.add(new SimpleGrantedAuthority("ROLE_INSTRUCTOR"));
    } else {
      authorities.add(new SimpleGrantedAuthority("ROLE_STUDENT"));
    }

    return new User(users.getLoginId(), users.getPassword(), authorities);
  }
}
