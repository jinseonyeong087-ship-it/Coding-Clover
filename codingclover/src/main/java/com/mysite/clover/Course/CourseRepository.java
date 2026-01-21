package com.mysite.clover.Course;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {

    // 강사별 강좌
    List<Course> findByCreatedByUserId(Long userId);

    List<Course> findByCreatedByUserIdAndProposalStatus(Long userId, CourseProposalStatus proposalStatus);

    // 레벨별 강좌
    List<Course> findByLevel(int level);

    // 승인된 강좌 조회 (공개용)
    List<Course> findByProposalStatus(CourseProposalStatus proposalStatus);

    List<Course> findByProposalStatusAndLevel(CourseProposalStatus proposalStatus, int level);

    // 모집 중인 강좌 조회 (승인됨 + 마감안됨) - ProposalStatus.APPROVED implies recruiting unless
    // separate close flag?
    // User wants "Close" feature. If I use CLOSED status, then
    // findByProposalStatus(APPROVED) is fine for recruiting.
}
