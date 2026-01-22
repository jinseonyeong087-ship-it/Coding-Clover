package com.mysite.clover.Lecture;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;

public interface LectureRepository extends JpaRepository<Lecture, Long> {

    /**
     * 특정 강좌의 강의 목록 조회 (순서대로)
     * 
     * @param course 강좌
     * @return 순서대로 정렬된 강의 목록
     */
    List<Lecture> findByCourseOrderByOrderNoAsc(Course course);

    /**
     * 강사별 등록 강의 목록 조회
     * 
     * @param user 강사
     * @return 강의 목록
     */
    List<Lecture> findByCreatedBy(Users user);

    /**
     * 승인 상태별 강의 목록 조회 (관리자용)
     * 
     * @param approvalStatus 승인 상태
     * @return 강의 목록
     */
    List<Lecture> findByApprovalStatus(String approvalStatus);

    /**
     * 강좌별/상태별 강의 목록 조회 (순서대로)
     * 공개된(승인된) 강의 목록 조회 시 사용
     * 
     * @param course         강좌
     * @param approvalStatus 승인 상태
     * @return 순서대로 정렬된 강의 목록
     */
    List<Lecture> findByCourseAndApprovalStatusOrderByOrderNoAsc(Course course, String approvalStatus);

    /**
     * 강좌별/상태별 강의 개수 조회
     * 진도율 계산 등을 위해 사용
     * 
     * @param course         강좌
     * @param approvalStatus 승인 상태
     * @return 강의 개수
     */
    long countByCourseAndApprovalStatus(Course course, String approvalStatus);
}