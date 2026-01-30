package com.mysite.clover.Search;

import com.mysite.clover.Course.CourseRepository;
import com.mysite.clover.Lecture.LectureRepository;
import com.mysite.clover.Users.UsersRepository;
import com.mysite.clover.Users.UsersRole;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UsersRepository userRepository;
    private final CourseRepository courseRepository;
    private final LectureRepository lectureRepository;

    // 관리자 통합 검색
    public Page<?> searchByAdmin(String category, String keyword, Pageable pageable) {
        // 카테고리에 따른 검색
        switch (category.toUpperCase()) {
            // 학생 검색
            case "STUDENT":
                return userRepository.findByRoleAndNameContaining(UsersRole.STUDENT, keyword, pageable);
            // 강사 검색
            case "INSTRUCTOR":
                return userRepository.findByRoleAndNameContaining(UsersRole.INSTRUCTOR, keyword, pageable);
            // 강좌 검색
            case "COURSE":
                return courseRepository.findByTitleContaining(keyword, pageable);
            // 강의 검색
            case "LECTURE":
                return lectureRepository.findByTitleContaining(keyword, pageable);
            // 기타 검색
            default:
                // 카테고리 없이 이름으로 전체 검색
                return userRepository.findByNameContaining(keyword, pageable);
        }
    }
}