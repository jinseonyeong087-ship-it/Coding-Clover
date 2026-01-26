package com.mysite.clover.CommunityPost;

import org.springframework.data.jpa.repository.JpaRepository;

// 커뮤니티 댓글 데이터 접근을 위한 리포지토리 (기본적인 CRUD 메서드 제공)
public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {
}
