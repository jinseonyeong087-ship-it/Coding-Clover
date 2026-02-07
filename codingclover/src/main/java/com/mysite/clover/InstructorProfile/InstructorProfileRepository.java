package com.mysite.clover.InstructorProfile;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InstructorProfileRepository extends JpaRepository<InstructorProfile, Long> {

  // 유저(강사)여부 확인
  boolean existsByUserId(Long userId);

  // 강사 정보 가져오기
  Optional<InstructorProfile> findByUserId(Long userId);
  
  // 이력서 파일 경로로 프로필 조회
  Optional<InstructorProfile> findByResumeFilePath(String resumeFilePath);
  
  // 강사 정보 삭제 (탈퇴용)
  void deleteByUserId(Long userId);
}
