package com.mysite.clover.Course;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.reactive.socket.CloseStatus;

public interface CourseRepository extends JpaRepository<Course, Long> {

    // 강사별 강좌
    List<Course> findByCreatedByUserId(Long userId);
    List<Course> findByCreatedByUserIdAndProposalStatus(Long userId, CloseStatus proposalStatus);

}
