package com.mysite.clover.Lecture;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;

// 개별 강의 정보(Lecture)에 대한 DB DB 작업을 담당하는 리포지토리
public interface LectureRepository extends JpaRepository<Lecture, Long> {

    // 특정 강좌에 속한 모든 강의를 순서(orderNo)대로 정렬하여 조회
    List<Lecture> findByCourseOrderByOrderNoAsc(Course course);

    // 특정 강사(User)가 생성한 모든 강의 목록 조회 (강사 마이페이지 등에서 사용)
    List<Lecture> findByCreatedBy(Users user);

    // 승인 상태(PENDING, APPROVED 등)에 따른 강의 목록 조회 (관리자용)
    List<Lecture> findByApprovalStatus(LectureApprovalStatus approvalStatus);

    // 특정 강좌 내에서 특정 승인 상태인 강의만 조회하고 순서대로 정렬 (예: 수강생에게 공개된 강의만 조회)
    List<Lecture> findByCourseAndApprovalStatusOrderByOrderNoAsc(Course course, LectureApprovalStatus approvalStatus);

    // 특정 강좌의 특정 승인 상태인 강의 개수를 반환 (예: 승인된 강의가 몇 개인지 확인)
    long countByCourseAndApprovalStatus(Course course, LectureApprovalStatus approvalStatus);
}
