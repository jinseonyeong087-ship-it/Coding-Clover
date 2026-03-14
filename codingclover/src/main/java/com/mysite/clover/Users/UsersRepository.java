package com.mysite.clover.Users;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

  // 검색 기능
  // 관리자가 이름으로 사용자를 검색하는 로직
  Page<Users> findByNameContaining(String name, Pageable pageable);

  // 관리자가 역할(학생/강사) 필터링 후 '이름'으로 검색하는 로직
  Page<Users> findByRoleAndNameContaining(UsersRole role, String name, Pageable pageable);

  // 학생 목록 페이지네이션 (한 페이지에 10명씩 조회)
  Page<Users> findByRole(UsersRole role, Pageable pageable);

  // 학생 검색 + 페이지네이션 (이름 또는 로그인ID로 검색, 10명씩)
  @Query("SELECT u FROM Users u WHERE u.role = :role AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.loginId) LIKE LOWER(CONCAT('%', :keyword, '%')))")
  Page<Users> findByRoleAndKeyword(@Param("role") UsersRole role, @Param("keyword") String keyword, Pageable pageable);

  // 통계 카드용: 전체 학생 수
  long countByRole(UsersRole role);

  // 통계 카드용: 수강 경험이 있는 학생 수
  @Query("SELECT COUNT(DISTINCT e.user.userId) FROM Enrollment e WHERE e.user.role = :role")
  long countByRoleWithEnrollment(@Param("role") UsersRole role);
}