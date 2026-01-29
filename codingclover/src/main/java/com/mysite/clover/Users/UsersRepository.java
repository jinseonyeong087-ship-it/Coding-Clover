package com.mysite.clover.Users;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UsersRepository extends JpaRepository<Users, Long> {

  // 로그인 조회 (LoginId로 조회함)
  Optional<Users> findByLoginId(String LoginId);

  // 로그인 ID 중복 체크
  boolean existsByLoginId(String LoginId);

  // 이메일 중복 체크
  boolean existsByEmail(String Email);

  // 소셜 로그인
  Optional<Users> findByEmail(String email);

  // 관리자 - 강사관리 탭에서 사용될 예정
  List<Users> findByRole(UsersRole role);

  // 아이디 찾기
  Optional<Users> findByNameAndEmail(String name, String email);

  // 비밀번호 찾기
  Optional<Users> findByLoginIdAndNameAndEmail(String loginId, String name, String email);
}