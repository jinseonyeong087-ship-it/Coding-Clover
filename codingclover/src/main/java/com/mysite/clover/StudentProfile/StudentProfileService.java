package com.mysite.clover.StudentProfile;

import org.springframework.stereotype.Service;

import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentProfileService {
  
  private final StudentProfileRepository studentProfileRepository;
  private final UsersRepository usersRepository;

    // 수강생 프로필 조회 (DTO 반환)
    public StudentProfileDto getStudentProfile(Long userId) {

        StudentProfile profile = studentProfileRepository
                .findByUser_UserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("수강생 정보가 없습니다."));

        return new StudentProfileDto(
                profile.getUserId(),
                profile.getUser().getLoginId(),
                profile.getUser().getName(),
                profile.getUser().getEmail(),
                profile.getUser().getCreatedAt(),
                profile.getEducationLevel(),
                profile.getInterestCategory()
        );
    } 

    // 수강생 프로필 정보 수정
    public void updateStudentProfile(Long userId, StudentProfileDto updateDto) {
        // Users 정보 업데이트 (이름)
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자 정보가 없습니다."));
        
        if (updateDto.getName() != null) {
            user.setName(updateDto.getName());
            usersRepository.save(user);
        }

        // StudentProfile 정보 업데이트
        StudentProfile profile = studentProfileRepository
                .findByUser_UserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("수강생 정보가 없습니다."));

        if (updateDto.getEducationLevel() != null) {
            profile.setEducationLevel(updateDto.getEducationLevel());
        }
        if (updateDto.getInterestCategory() != null) {
            profile.setInterestCategory(updateDto.getInterestCategory());
        }

        studentProfileRepository.save(profile);
    }
}
