package com.mysite.clover.Lecture;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;

public interface LectureRepository extends JpaRepository<Lecture, Long> {

    // 특정 강좌의 강의 목록 (차시 순서대로)
    List<Lecture> findByCourseOrderByOrderNoAsc(Course course);

    // 강사별 등록 강의
    List<Lecture> findByCreatedBy(Users user);

    // 승인 상태별 조회 (관리자용)
    List<Lecture> findByApprovalStatus(String approvalStatus);

    // 레벨별/상태별 조회 (수강생 공개용)
    List<Lecture> findByCourseAndApprovalStatusOrderByOrderNoAsc(Course course, String approvalStatus);

    // 특정 강좌에서 특정 순서의 강의 조회
    // Lecture findByCourseAndOrderNo(Course course, int orderNo);
}