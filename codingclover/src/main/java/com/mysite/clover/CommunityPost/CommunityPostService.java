package com.mysite.clover.CommunityPost;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import com.mysite.clover.Users.Users;

// 커뮤니티 게시글 관련 비즈니스 로직 처리 서비스
@Service
@RequiredArgsConstructor
public class CommunityPostService {
    private final CommunityPostRepository communityPostRepository;

    // 수강생 전용: 신규 게시글 등록
    @Transactional
    public void create(String title, String content, Users user) {
        // 1. 게시글 엔티티 생성
        CommunityPost post = new CommunityPost();
        // 2. 제목 설정
        post.setTitle(title);
        // 3. 내용 설정
        post.setContent(content);
        // 4. 작성자 설정
        post.setUser(user);
        // 5. 기본 상태 설정 (VISIBLE: 공개)
        post.setStatus(PostStatus.VISIBLE);
        // 6. DB 저장
        communityPostRepository.save(post);
    }

    // 공통(수강생/관리자): 전체 공개 게시글 목록 조회
    public List<CommunityPost> getVisiblePosts() {
        // 상태가 VISIBLE(공개)인 게시글만 최신순(작성일 내림차순)으로 조회
        return communityPostRepository.findByStatusOrderByCreatedAtDesc(PostStatus.VISIBLE);
    }

    // 공통(수강생/관리자): 게시글 상세 조회
    public CommunityPost getPost(Long id) {
        // ID로 게시글 조회, 없으면 예외 발생
        return communityPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));
    }

    // 수강생 전용: 본인이 작성한 게시글 수정
    @Transactional
    public void updatePost(Long id, String title, String content, String loginId) {
        // 1. 게시글 조회
        CommunityPost post = getPost(id);

        // 2. 작성자 본인 확인 (로그인한 ID와 게시글 작성자 ID 비교)
        if (!post.getUser().getLoginId().equals(loginId)) {
            throw new RuntimeException("본인의 글만 수정할 수 있습니다.");
        }

        // 3. 제목 및 내용 수정 (Setter -> Dirty Checking)
        post.setTitle(title);
        post.setContent(content);

        // 4. 저장 (명시적 save 호출은 선택사항이나 확실히 하기 위해)
        communityPostRepository.save(post);
    }

    // 수강생(본인) 및 관리자(강제): 게시글 삭제 (실제 삭제가 아닌 숨김 처리)
    @Transactional
    public void deletePost(Long id, Users user) {
        // 1. 게시글 조회
        CommunityPost post = getPost(id);

        // 2. 작성자 본인 여부 확인
        boolean isOwner = post.getUser().getLoginId().equals(user.getLoginId());
        // 3. 관리자 권한 여부 확인
        boolean isAdmin = user.getRole().name().equals("ADMIN");

        // 4. 본인이거나 관리자인 경우에만 삭제 허용
        if (isOwner || isAdmin) {
            // 5. 실제 삭제 대신 상태를 HIDDEN(숨김)으로 변경 (Soft Delete)
            post.setStatus(PostStatus.HIDDEN);
            // 6. 변경사항 저장
            communityPostRepository.save(post);
        } else {
            // 권한이 없으면 예외 발생
            throw new RuntimeException("삭제 권한이 없습니다.");
        }
    }
}
