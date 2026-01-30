package com.mysite.clover.Notice;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    // 공개된 공지사항만 최신순 조회
    List<Notice> findByStatusOrderByCreatedAtDesc(NoticeStatus status);

    // 전체 공지사항 최신순 조회 (관리자용)
    List<Notice> findAllByOrderByCreatedAtDesc();

    // 공지사항 제목 검색
    Page<?> findByTitleContaining(String keyword, Pageable pageable);
}
