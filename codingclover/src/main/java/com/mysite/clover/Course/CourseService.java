package com.mysite.clover.Course;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.mysite.clover.Users.Users;

import lombok.RequiredArgsConstructor;

// 강좌 서비스
@RequiredArgsConstructor
@Service
public class CourseService {

    // 리포지토리 객체 주입
    private final CourseRepository cr;

    // 강좌 목록 반환
    public List<Course> getList() {
        return cr.findAll();
    }

    // 강좌 생성
    public void create(String title, String description, int level, int price, Users user) {

    // 강좌 객체 생성 및 설정
    Course course = new Course();

    // 필드 설정
    course.setTitle(title);

    // 설명 설정
    course.setDescription(description);

    // 난이도 설정
    course.setLevel(level);

    // 가격 설정
    course.setPrice(price);

    // 기타 필드 설정
    course.setCreatedBy(user);

    // 생성 일시 설정
    course.setCreatedAt(LocalDateTime.now());

    // 제안 상태 설정
    course.setProposalStatus

    // 대기 중으로 설정
    ("PENDING");

    // 강좌 저장
    cr.save(course);
}

    // 강좌 조회
    public Course getCourse(Long id) {
        // 강좌가 없으면 예외 발생
        return cr.findById(id)
                .orElseThrow(() -> new RuntimeException("강좌 없음"));
    }
}
