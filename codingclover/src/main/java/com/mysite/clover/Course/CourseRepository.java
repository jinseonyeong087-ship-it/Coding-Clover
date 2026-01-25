package com.mysite.clover.Course;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

// Course 엔티티에 대한 데이터베이스 접근을 담당하는 리포지토리
public interface CourseRepository extends JpaRepository<Course, Long> {

    // 특정 강사(User ID)가 생성한 모든 강좌 목록을 조회 (강사 마이페이지 등)
    List<Course> findByCreatedByUserId(Long userId);

    // 특정 강사가 생성한 강좌 중, 특정 승인 상태(예: PENDING, APPROVED)인 강좌 목록 조회
    List<Course> findByCreatedByUserIdAndProposalStatus(Long userId, CourseProposalStatus proposalStatus);

    // 난이도(레벨)별 강좌 목록 조회
    List<Course> findByLevel(int level);

    // 승인 상태(예: 승인됨, 대기중, 반려됨)에 따른 강좌 목록 조회 (관리자용, 사용자용)
    List<Course> findByProposalStatus(CourseProposalStatus proposalStatus);

    // 승인 상태와 난이도를 동시에 만족하는 강좌 목록 조회 (예: 승인된 초급 강좌)
    List<Course> findByProposalStatusAndLevel(CourseProposalStatus proposalStatus, int level);
}
