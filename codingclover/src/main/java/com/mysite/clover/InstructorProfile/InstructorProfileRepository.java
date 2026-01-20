package com.mysite.clover.InstructorProfile;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InstructorProfileRepository extends JpaRepository<InstructorProfile, Long> {
  
 //유저(강사)여부 확인
  boolean existsByUser_UserId(Long userId);

  //강사 정보 가져오기
  Optional<InstructorProfile> findByUser_UserId(Long userId);
}
