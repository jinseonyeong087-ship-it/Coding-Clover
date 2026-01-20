package com.mysite.clover.StudentProfile;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
  
  //유저(수강생)여부 확인
  boolean existsByUser_UserId(Long userId);

  //수강생 정보 가져오기
  Optional<StudentProfile> findByUser_UserId(Long userId);
}
