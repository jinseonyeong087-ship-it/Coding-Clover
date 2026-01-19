package com.mysite.clover.Course;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {

    // 강사별 강좌
    List<Course> findByCreatedBy_UserId(Long userId);
}
