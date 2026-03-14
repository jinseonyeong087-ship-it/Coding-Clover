package com.mysite.clover.CommunityPost;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;

import java.security.Principal;
import lombok.RequiredArgsConstructor;
import com.mysite.clover.Users.UsersRepository;
import com.mysite.clover.Users.Users;
import com.mysite.clover.CommunityPost.dto.PostCreateRequest;
import com.mysite.clover.CommunityPost.dto.PostResponse;
import com.mysite.clover.CommunityPost.dto.CommentRequest;
import jakarta.validation.Valid;

// 커뮤니티 게시판 기능을 제공하는 컨트롤러
@RestController
@RequiredArgsConstructor
public class CommunityPostController {

    private final CommunityPostService communityPostService;
    private final UsersRepository usersRepository;

    // 1. 게시글 목록 조회
    // 전체 게시글 조회
    @GetMapping("/api/community/posts")
    public ResponseEntity<Page<PostResponse>> list(
            // 페이징 파라미터
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            // 검색어
            @RequestParam(value = "keyword", required = false) String keyword,
            // 내 게시글만 조회 여부
            @RequestParam(value = "myPostsOnly", defaultValue = "false") boolean myPostsOnly,
            Authentication authentication) {
        // 로그인 정보 확인
        String currentUsername = (authentication != null) ? authentication.getName() : null;
        // 로그인 정보를 이용한 권한 체크
        Users currentUser = null;
        // 관리자 여부
        boolean isAdmin = false;
        // 로그인 정보가 없으면 null, 관리자 아니면 false
        if (currentUsername != null) {
            currentUser = usersRepository.findByLoginId(currentUsername).orElse(null);
            isAdmin = currentUser != null && "ADMIN".equals(currentUser.getRole().name());
        }

        // 게시글 목록 조회
        Page<PostResponse> posts = communityPostService.getVisiblePosts(page, size, keyword, myPostsOnly,
                currentUsername, isAdmin);
        // 응답
        return ResponseEntity.ok(posts);
    }

    // 게시글 상세 조회
    @GetMapping("/api/community/posts/{id}")
    public ResponseEntity<PostResponse> detail(@PathVariable Long id, Authentication authentication) {
        Users currentUser = null;
        if (authentication != null) {
            currentUser = usersRepository.findByLoginId(authentication.getName()).orElse(null);
        }

        PostResponse post = communityPostService.getPost(id, currentUser);
        return ResponseEntity.ok(post);
    }

    // 게시글 등록
    @PostMapping("/api/community/posts/new")
    public ResponseEntity<?> create(@Valid @RequestBody PostCreateRequest request,
            BindingResult bindingResult, Principal principal) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors().get(0).getDefaultMessage());
        }

        if (principal == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        // 권한 체크 (학생만)
        Users user = usersRepository.findByLoginId(principal.getName()).orElseThrow();
        if ("INSTRUCTOR".equals(user.getRole().name())) {
            return ResponseEntity.status(403).body("강사는 글을 쓸 수 없습니다.");
        }

        communityPostService.create(request.getTitle(), request.getContent(), user);
        return ResponseEntity.ok("등록 성공");
    }

    // 게시글 수정
    @PutMapping("/api/community/posts/{id}/edit")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody PostCreateRequest request,
            BindingResult bindingResult, Principal principal) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors().get(0).getDefaultMessage());
        }

        if (principal == null)
            return ResponseEntity.status(401).body("로그인이 필요합니다.");

        // 권한 체크는 Service에서 본인 확인 수행
        communityPostService.updatePost(id, request.getTitle(), request.getContent(), principal.getName());
        return ResponseEntity.ok("수정 성공");
    }

    // 게시글 삭제
    @DeleteMapping("/api/community/posts/{id}/delete")
    public ResponseEntity<String> delete(@PathVariable Long id, Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).body("로그인이 필요합니다.");

        Users user = usersRepository.findByLoginId(principal.getName()).orElseThrow();
        communityPostService.deletePost(id, user); // Service logs logic handles admin/owner check
        return ResponseEntity.ok("삭제 성공");
    }

    // ==========================================
    // 💬 댓글 Endpoints
    // ==========================================

    // 댓글 등록
    @PostMapping("/api/community/posts/{postId}/comments")
    public ResponseEntity<?> createComment(@PathVariable Long postId,
            @Valid @RequestBody CommentRequest request,
            BindingResult bindingResult,
            Principal principal) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors().get(0).getDefaultMessage());
        }

        if (principal == null)
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        Users user = usersRepository.findByLoginId(principal.getName()).orElseThrow();

        if ("INSTRUCTOR".equals(user.getRole().name())) {
            return ResponseEntity.status(403).body("강사는 댓글을 쓸 수 없습니다.");
        }

        communityPostService.createComment(postId, request.getContent(), user);
        return ResponseEntity.ok("댓글 등록 성공");
    }

    // 댓글 수정
    @PutMapping("/api/community/comments/{commentId}")
    public ResponseEntity<?> updateComment(@PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request,
            BindingResult bindingResult,
            Principal principal) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors().get(0).getDefaultMessage());
        }
        if (principal == null)
            return ResponseEntity.status(401).body("로그인이 필요합니다.");

        communityPostService.updateComment(commentId, request.getContent(), principal.getName());
        return ResponseEntity.ok("댓글 수정 성공");
    }

    // 댓글 삭제
    @DeleteMapping("/api/community/comments/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable Long commentId, Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).body("로그인이 필요합니다.");

        Users user = usersRepository.findByLoginId(principal.getName()).orElseThrow();
        communityPostService.deleteComment(commentId, user);
        return ResponseEntity.ok("댓글 삭제 성공");
    }

    // 관리자 전용: 게시글 숨김
    @PutMapping("/api/community/posts/{id}/hide")
    public ResponseEntity<String> hidePost(@PathVariable Long id, Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).body("로그인이 필요합니다.");

        Users user = usersRepository.findByLoginId(principal.getName()).orElseThrow();
        communityPostService.setPostStatus(id, user, PostStatus.HIDDEN);
        return ResponseEntity.ok("숨김 처리 완료");
    }

    // 관리자 전용: 게시글 복구
    @PutMapping("/api/community/posts/{id}/unhide")
    public ResponseEntity<String> unhidePost(@PathVariable Long id, Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).body("로그인이 필요합니다.");

        Users user = usersRepository.findByLoginId(principal.getName()).orElseThrow();
        communityPostService.setPostStatus(id, user, PostStatus.VISIBLE);
        return ResponseEntity.ok("복구 완료");
    }

    // 관리자 전용: 댓글 숨김
    @PutMapping("/api/community/comments/{commentId}/hide")
    public ResponseEntity<String> hideComment(@PathVariable Long commentId, Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).body("로그인이 필요합니다.");

        Users user = usersRepository.findByLoginId(principal.getName()).orElseThrow();
        communityPostService.setCommentStatus(commentId, user, PostStatus.HIDDEN);
        return ResponseEntity.ok("댓글 숨김 처리 완료");
    }

    // 관리자 전용: 댓글 복구
    @PutMapping("/api/community/comments/{commentId}/unhide")
    public ResponseEntity<String> unhideComment(@PathVariable Long commentId, Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).body("로그인이 필요합니다.");

        Users user = usersRepository.findByLoginId(principal.getName()).orElseThrow();
        communityPostService.setCommentStatus(commentId, user, PostStatus.VISIBLE);
        return ResponseEntity.ok("댓글 복구 완료");
    }
}
