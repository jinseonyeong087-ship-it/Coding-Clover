package com.mysite.clover.Lecture;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;

public interface LectureRepository extends JpaRepository<Lecture, Long> {

    // 특정 강좌의 강의 목록 조회 (순서대로)
    List<Lecture> findByCourseOrderByOrderNoAsc(Course course);

    // 강사별 등록 강의 목록 조회
    List<Lecture> findByCreatedBy(Users user);

    // 승인 상태별 강의 목록 조회 (관리자용)
    List<Lecture> findByApprovalStatus(LectureApprovalStatus approvalStatus);

    // 강좌별/상태별 강의 목록 조회 (순서대로)
    List<Lecture> findByCourseAndApprovalStatusOrderByOrderNoAsc(Course course, LectureApprovalStatus approvalStatus);

    // 강좌별/상태별 강의 개수 조회
    long countByCourseAndApprovalStatus(Course course, LectureApprovalStatus approvalStatus);
}