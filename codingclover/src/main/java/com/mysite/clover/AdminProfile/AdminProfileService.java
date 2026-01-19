package com.mysite.clover.AdminProfile;

import org.springframework.stereotype.Service;

import com.mysite.clover.Users.UsersRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProfileService {
  
  //관리자 프로필 조회
  private final AdminProfileRepository adminProfileRepository;
  //관리자 만들 때 사용자 존재 확인
  private final UsersRepository usersRepository;

  //관리자 여부 확인(true/false)
  public boolean isAdmin(Long userId) {
    return adminProfileRepository.existsByUser_UserId(userId);
  }

  //관리자 권한 검증
  public void validateAdmin(Long userId) {
    if (!adminProfileRepository.existsByUser_UserId(userId)) {
      throw new IllegalArgumentException("관리자 권한이 없습니다.");
    }
  }
}

//validateAdmin 관리자가 아니면 예외를 던짐(통과or예외
//IllegalArgumentException 기본 예외 클래스 중 하나