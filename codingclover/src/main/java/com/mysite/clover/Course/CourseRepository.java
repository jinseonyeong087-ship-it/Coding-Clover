package com.mysite.clover.Course;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {

    /**
     * 특정 강사가 생성한 강좌 목록 조회
     * 
     * @param userId 강사 ID
     * @return 강좌 목록
     */
    List<Course> findByCreatedByUserId(Long userId);

    /**
     * 특정 강사의 상태별 강좌 목록 조회
     * 
     * @param userId         강사 ID
     * @param proposalStatus 승인 상태
     * @return 강좌 목록
     */
    List<Course> findByCreatedByUserIdAndProposalStatus(Long userId, CourseProposalStatus proposalStatus);

    /**
     * 레벨별 강좌 목록 조회
     * 
     * @param level 강좌 레벨
     * @return 강좌 목록
     */
    List<Course> findByLevel(int level);

    /**
     * 승인 상태별 강좌 목록 조회
     * 
     * @param proposalStatus 승인 상태
     * @return 강좌 목록
     */
    List<Course> findByProposalStatus(CourseProposalStatus proposalStatus);

    /**
     * 승인 상태 및 레벨별 강좌 목록 조회
     * 
     * @param proposalStatus 승인 상태
     * @param level          강좌 레벨
     * @return 강좌 목록
     */
    List<Course> findByProposalStatusAndLevel(CourseProposalStatus proposalStatus, int level);
}
