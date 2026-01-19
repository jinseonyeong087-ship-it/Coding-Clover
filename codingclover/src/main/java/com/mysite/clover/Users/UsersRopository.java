package com.mysite.clover.Users;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UsersRopository extends JpaRepository<Users, Long> {

  // 로그인 조회 (LoginId로 조회함)
  Optional<Users> findByLoginId(String LoginId);

  // 로그인 ID 중복 체크
  boolean existsByLoginId(String LoginId);

  // 이메일 중복 체크
  boolean existsByEmail(String Email);

}