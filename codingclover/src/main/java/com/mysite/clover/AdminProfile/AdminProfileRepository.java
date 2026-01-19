package com.mysite.clover.AdminProfile;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminProfileRepository extends JpaRepository<AdminProfile, Long> {
  
  //유저(관리자) 확인
  boolean existsByUser_UserId(Long userId);

}
