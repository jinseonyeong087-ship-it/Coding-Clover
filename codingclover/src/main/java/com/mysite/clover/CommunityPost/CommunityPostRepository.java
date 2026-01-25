package com.mysite.clover.CommunityPost;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// 커뮤니티 게시글(CommunityPost)에 대한 DB 접근을 담당하는 리포지토리
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    // 특정 상태(예: VISIBLE)인 게시글만 조회하고, 생성일 기준 내림차순(최신순)으로 정렬
    List<CommunityPost> findByStatusOrderByCreatedAtDesc(PostStatus status);
}
