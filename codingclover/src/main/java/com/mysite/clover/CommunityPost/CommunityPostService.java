package com.mysite.clover.CommunityPost;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.mysite.clover.Users.Users;
import com.mysite.clover.CommunityPost.dto.PostResponse;

// 커뮤니티 게시글 관련 비즈니스 로직 처리 서비스
@Service
@RequiredArgsConstructor
public class CommunityPostService {
    private final CommunityPostRepository communityPostRepository;
    private final CommunityCommentRepository communityCommentRepository;
    private final com.mysite.clover.Notification.NotificationService notificationService;

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

    // 게시글 목록 조회 (검색 + 페이징 + 필터링)
    @Transactional(readOnly = true)
        public Page<PostResponse> getVisiblePosts(int page, int size, String keyword, boolean myPostsOnly,
            String currentUsername, boolean isAdmin) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CommunityPost> postPage;

        if (myPostsOnly && currentUsername != null) {
            // 내 글 보기: 사용자 ID로 조회 (로그인 ID -> User Entity -> ID)
            // 여기서는 편의상 currentUsername(loginId)으로 User를 찾거나, 리포지토리에 loginId 기반 검색 추가 필요.
            // 현재 리포지토리는 userId(PK)를 받으므로, userService 등을 통해 PK를 알아내거나,
            // 리포지토리에 findByUserLoginId 메서드를 추가하는 것이 좋음.
            // 일단 기존 findByUserUserLoginId 가 없으므로, User를 먼저 조회한다고 가정하거나 리포지토리 수정.
            // 성능을 위해 리포지토리에 JOIN FETCH p.user WHERE p.user.loginId = :loginId 추가 권장.
            // 임시로 User 조회 로직 생략하고 리포지토리 수정 없이 가려면 userService 필요.
            // 하지만 Service 간 순환 참조 방지를 위해 Repository에 메서드 추가가 깔끔함.
            // 여기서는 일단 단순화를 위해 userId 검색 로직 유지 (호출부에서 처리 필요할 수도 있음)
            // -> Controller에서 Principal로 User 조회 후 ID 넘기는 게 정석.
            // 하지만 메서드 시그니처가 String currentUsername이므로, 레포지토리에 메서드 추가.
            // 기존 findByUser(SiteUser user, ...) 메서드가 있었으니 그걸 활용?
            // 아까 리포지토리 수정에서 findByUser(Long userId, ...)로 바꿨음.
            throw new UnsupportedOperationException("내 글 보기 기능은 컨트롤러에서 User 정보를 받아 처리해야 합니다.");
        } else if (keyword != null && !keyword.isBlank()) {
            if (isAdmin) {
                postPage = communityPostRepository.searchByKeywordIncludingHidden(keyword, pageable);
            } else {
                postPage = communityPostRepository.searchByKeyword(keyword, pageable);
            }
        } else {
            if (isAdmin) {
                postPage = communityPostRepository.findAllByOrderByCreatedAtDesc(pageable);
            } else {
                postPage = communityPostRepository.findByStatusOrderByCreatedAtDesc(PostStatus.VISIBLE, pageable);
            }
        }

        return postPage.map(post -> PostResponse.fromEntity(post, false));
    }

    // 게시글 상세 조회
    @Transactional
    public PostResponse getPost(Long postId, Users viewer) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        boolean isAdmin = viewer != null && viewer.getRole().name().equals("ADMIN");
        boolean isOwner = viewer != null && post.getUser().getLoginId().equals(viewer.getLoginId());

        if (post.getStatus() == PostStatus.HIDDEN && !isAdmin && !isOwner) {
            throw new IllegalArgumentException("게시글을 찾을 수 없습니다.");
        }

        // 상세 조회 시 댓글 포함
        return PostResponse.fromEntity(post, true, isAdmin);
    }

    // 내부 조회용 (엔티티 반환 - 컨트롤러가 아닌 서비스 내부 로직용)
    @Transactional(readOnly = true)
    public CommunityPost getPostEntity(Long id) {
        // ID로 게시글 엔티티 조회
        return communityPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));
    }

    // 수강생 전용: 본인이 작성한 게시글 수정
    @Transactional
    public void updatePost(Long id, String title, String content, String loginId) {
        // 1. 게시글 엔티티 조회
        CommunityPost post = getPostEntity(id);

        // 2. 작성자 본인 확인 (로그인한 ID와 게시글 작성자 ID 비교)
        if (!post.getUser().getLoginId().equals(loginId)) {
            throw new RuntimeException("본인의 글만 수정할 수 있습니다.");
        }

        // 3. 제목 및 내용 수정 (Setter -> Dirty Checking으로 자동 업데이트)
        post.setTitle(title);
        post.setContent(content);

        // 4. 저장 (명시적 호출)
        communityPostRepository.save(post);
    }

    // 수강생(본인) 및 관리자(강제): 게시글 삭제 (실제 삭제가 아닌 숨김 처리)
    @Transactional
    public void deletePost(Long id, Users user) {
        // 1. 삭제할 게시글 조회
        CommunityPost post = getPostEntity(id);

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

    // ==========================================
    // 💬 댓글 기능
    // ==========================================

    // 댓글 등록
    @Transactional
    public void createComment(Long postId, String content, Users user) {
        // 1. 댓글을 달 게시글 조회
        CommunityPost post = getPostEntity(postId);

        // 2. 댓글 엔티티 생성 및 정보 설정
        CommunityComment comment = new CommunityComment();
        comment.setContent(content);
        comment.setPost(post);
        comment.setUser(user);
        comment.setStatus(PostStatus.VISIBLE);

        // 3. DB 저장
        communityCommentRepository.save(comment);

        // 4. 게시글 작성자에게 알림 전송 (본인이 쓴 댓글이 아닌 경우에만)
        if (!post.getUser().getLoginId().equals(user.getLoginId())) {
            notificationService.createNotification(
                    post.getUser(),
                    "NEW_COMMENT",
                    "작성하신 게시글 '" + post.getTitle() + "'에 새로운 댓글이 달렸습니다.",
                    "/community/" + postId);
        }
    }

    // 댓글 수정
    @Transactional
    public void updateComment(Long commentId, String content, String loginId) {
        // 1. 수정할 댓글 조회
        CommunityComment comment = communityCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글이 존재하지 않습니다."));

        // 2. 본인 확인
        if (!comment.getUser().getLoginId().equals(loginId)) {
            throw new RuntimeException("본인의 댓글만 수정할 수 있습니다.");
        }

        // 3. 내용 수정 (Dirty Checking)
        comment.setContent(content);
    }

    // 댓글 삭제
    @Transactional
    public void deleteComment(Long commentId, Users user) {
        // 1. 삭제할 댓글 조회
        CommunityComment comment = communityCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글이 존재하지 않습니다."));

        // 2. 권한 확인 (본인 또는 관리자)
        boolean isOwner = comment.getUser().getLoginId().equals(user.getLoginId());
        boolean isAdmin = user.getRole().name().equals("ADMIN");

        // 3. 삭제 수행
        if (isOwner || isAdmin) {
            communityCommentRepository.delete(comment); // 댓글은 실제 삭제 (또는 숨김 처리 정책에 따라 변경 가능)
        } else {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }
    }

    // 관리자 전용: 게시글 숨김/복구
    @Transactional
    public void setPostStatus(Long postId, Users user, PostStatus status) {
        if (!user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("관리자만 변경할 수 있습니다.");
        }

        CommunityPost post = getPostEntity(postId);
        post.setStatus(status);
        communityPostRepository.save(post);
    }

    // 관리자 전용: 댓글 숨김/복구
    @Transactional
    public void setCommentStatus(Long commentId, Users user, PostStatus status) {
        if (!user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("관리자만 변경할 수 있습니다.");
        }

        CommunityComment comment = communityCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글이 존재하지 않습니다."));
        comment.setStatus(status);
        communityCommentRepository.save(comment);
    }
}
