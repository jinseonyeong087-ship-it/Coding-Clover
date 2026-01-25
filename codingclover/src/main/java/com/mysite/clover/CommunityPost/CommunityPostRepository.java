package com.mysite.clover.CommunityPost;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * 커뮤니티 게시글 리포지토리
 * 게시글 데이터베이스 접근을 위한 인터페이스입니다.
 * JPA를 상속받아 기본적인 CRUD 기능을 제공하며, 상태별 조회 등의 커스텀 메서드를 정의합니다.
 */
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    // 상태가 VISIBLE인 게시글만 최신순으로 조회
    List<CommunityPost> findByStatusOrderByCreatedAtDesc(PostStatus status);
}