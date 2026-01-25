package com.mysite.clover.CommunityPost;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import com.mysite.clover.Users.Users;

/**
 * 커뮤니티 게시글 서비스
 * 게시글과 관련된 비즈니스 로직을 처리합니다.
 * 게시글 생성, 조회, 수정, 삭제(숨김 처리) 기능을 제공하며, 권한 검증 로직을 포함합니다.
 */
@Service
@RequiredArgsConstructor
public class CommunityPostService {
    private final CommunityPostRepository communityPostRepository;

    // 수강생 전용: 게시글 등록
    @Transactional
    public void create(String title, String content, Users user) {
        CommunityPost post = new CommunityPost();
        post.setTitle(title);
        post.setContent(content);
        post.setUser(user);
        post.setStatus(PostStatus.VISIBLE);
        communityPostRepository.save(post);
    }

    // 공통(수강생/관리자): 목록 및 상세 조회
    public List<CommunityPost> getVisiblePosts() {
        return communityPostRepository.findByStatusOrderByCreatedAtDesc(PostStatus.VISIBLE);
    }

    public CommunityPost getPost(Long id) {
        return communityPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));
    }

    // 수강생 전용: 본인 글 수정
    @Transactional
    public void updatePost(Long id, String title, String content, String loginId) {
        CommunityPost post = getPost(id);
        if (!post.getUser().getLoginId().equals(loginId)) {
            throw new RuntimeException("본인의 글만 수정할 수 있습니다.");
        }
        post.setTitle(title);
        post.setContent(content);
        communityPostRepository.save(post);
    }

    // 수강생(본인) 및 관리자(강제): 삭제
    @Transactional
    public void deletePost(Long id, Users user) {
        CommunityPost post = getPost(id);
        boolean isOwner = post.getUser().getLoginId().equals(user.getLoginId());
        boolean isAdmin = user.getRole().name().equals("ADMIN");

        if (isOwner || isAdmin) {
            post.setStatus(PostStatus.HIDDEN); // 실제 삭제 대신 숨김 처리 권장
            communityPostRepository.save(post);
        } else {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }
    }
}
