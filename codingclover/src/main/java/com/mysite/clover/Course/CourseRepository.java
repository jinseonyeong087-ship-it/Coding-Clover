package com.mysite.clover.Course;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

// 강좌 관련 DB 접근
public interface CourseRepository extends JpaRepository<Course, Long> {

    // 강사별 강좌
    List<Course> findByCreatedByUserId(long loginId);

    // 강사별 승인 상태 필터링
    List<Course> findByCreatedByUserIdAndProposalStatus(Long userId, CourseProposalStatus proposalStatus);

    // 레벨별 강좌
    List<Course> findByLevel(int level);

    // 승인 상태별 강좌
    List<Course> findByProposalStatus(CourseProposalStatus proposalStatus);

    // 승인 상태 및 레벨 필터링
    List<Course> findByProposalStatusAndLevel(CourseProposalStatus proposalStatus, int level);

    // 강좌 승인(APPROVED) + 강의 승인(APPROVED) + 강의 1개 이상인 강좌만 조회
    @Query("SELECT DISTINCT c FROM Course c JOIN Lecture l ON c.courseId = l.course.courseId WHERE c.proposalStatus = 'APPROVED' AND l.approvalStatus = 'APPROVED'")
    List<Course> findApprovedCoursesWithLectures();

    // 강좌 승인(APPROVED) + 강의 승인(APPROVED) + 강의 1개 이상인 강좌만 레벨별 조회
    @Query("SELECT DISTINCT c FROM Course c JOIN Lecture l ON c.courseId = l.course.courseId WHERE c.proposalStatus = 'APPROVED' AND l.approvalStatus = 'APPROVED' AND c.level = :level")
    List<Course> findApprovedCoursesWithLecturesByLevel(@Param("level") int level);

    // 로그인 ID 기준 강사 강좌
    List<Course> findByCreatedBy_LoginId(String loginId);

    // 제목 검색 (페이징)
    Page<Course> findByTitleContaining(String title, Pageable pageable);
}
