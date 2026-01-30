package com.mysite.clover.Problem;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemRepository extends JpaRepository<Problem, Long> {

    // 코딩 테스트 제목 검색
    Page<?> findByTitleContaining(String keyword, Pageable pageable);

}
