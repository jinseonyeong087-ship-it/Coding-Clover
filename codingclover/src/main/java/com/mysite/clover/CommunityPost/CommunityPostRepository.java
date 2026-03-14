package com.mysite.clover.CommunityPost;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// 게시글 DB 접근
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    // 상태별 조회
    Page<CommunityPost> findByStatusOrderByCreatedAtDesc(PostStatus status, Pageable pageable);

    // 검색 (제목, 내용, 작성자) + 페이징 + 댓글 수/작성자 정보 포함(최적화)
    // viewCount도 함께 가져오도록 엔티티 전체 조회
    @Query("SELECT p FROM CommunityPost p JOIN FETCH p.user WHERE " +
            "(p.title LIKE %:keyword% OR p.content LIKE %:keyword% OR p.user.name LIKE %:keyword%) " +
            "AND p.status = 'VISIBLE' " +
            "ORDER BY p.createdAt DESC")
    Page<CommunityPost> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // 관리자용 검색 (숨김 포함)
    @Query("SELECT p FROM CommunityPost p JOIN FETCH p.user WHERE " +
            "(p.title LIKE %:keyword% OR p.content LIKE %:keyword% OR p.user.name LIKE %:keyword%) " +
            "ORDER BY p.createdAt DESC")
    Page<CommunityPost> searchByKeywordIncludingHidden(@Param("keyword") String keyword, Pageable pageable);

    // 관리자용 전체 목록 (숨김 포함)
    Page<CommunityPost> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 특정 사용자 작성 글 조회 + 페이징
    @Query("SELECT p FROM CommunityPost p JOIN FETCH p.user WHERE p.user.id = :userId AND p.status = 'VISIBLE' ORDER BY p.createdAt DESC")
    Page<CommunityPost> findByUser(@Param("userId") Long userId, Pageable pageable);

    // 커뮤니티 게시글 제목 검색
    Page<?> findByTitleContaining(String keyword, Pageable pageable);
}
