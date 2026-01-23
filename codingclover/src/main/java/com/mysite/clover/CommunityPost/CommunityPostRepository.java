package com.mysite.clover.CommunityPost;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    // 상태가 VISIBLE인 게시글만 최신순으로 조회
    List<CommunityPost> findByStatusOrderByCreatedAtDesc(PostStatus status);
}