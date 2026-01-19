package com.mysite.clover.AdminProfile;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminProfileRepository extends JpaRepository<AdminProfile, Long> {
  
  //유저(관리자) 여부 확인
  boolean existsByUser_UserId(Long userId);

  //관리자 정보 가져오기
  Optional<AdminProfile> findByUser_UserId(Long userId);

}
