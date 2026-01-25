package com.mysite.clover.CommunityPost;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.Map;
import java.util.List;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import com.mysite.clover.Users.UsersRepository;
import com.mysite.clover.Users.Users;

/**
 * 커뮤니티 게시글 컨트롤러
 * 클라이언트의 게시글 관련 요청(조회, 등록, 수정, 삭제)을 처리합니다.
 * REST API 형태로 동작하며, 요청 URL과 HTTP 메서드에 따라 적절한 서비스 로직을 호출합니다.
 */
@RestController
@RequiredArgsConstructor
public class CommunityPostController {
    private final CommunityPostService communityPostService;
    private final UsersRepository usersRepository;

    // 1. 목록 조회: /api 추가
    // @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @GetMapping("/api/community/posts")
    public ResponseEntity<List<CommunityPost>> list(Principal principal) {
        System.out.println("=== DEBUG: /api/community/posts ===");
        if (principal == null) {
            System.out.println("Principal is NULL (Anonymous)");
        } else {
            System.out.println("Principal Name: " + principal.getName());
            System.out.println("Authentication: "
                    + org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication());
        }
        return ResponseEntity.ok(communityPostService.getVisiblePosts());
    }

    // 2. 상세 조회: /api 추가
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @GetMapping("/api/community/posts/{id}")
    public ResponseEntity<CommunityPost> detail(@PathVariable Long id) {
        return ResponseEntity.ok(communityPostService.getPost(id));
    }

    // 3. 등록: /api 추가
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/api/community/posts/new")
    public ResponseEntity<String> create(@RequestBody Map<String, String> params, Principal principal) {
        Users user = usersRepository.findByLoginId(principal.getName()).orElseThrow();
        communityPostService.create(params.get("title"), params.get("content"), user);
        return ResponseEntity.ok("등록 성공");
    }

    // 4. 수정: /api 추가
    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/api/community/posts/{id}/edit")
    public ResponseEntity<String> update(@PathVariable Long id, @RequestBody Map<String, String> params,
            Principal principal) {
        communityPostService.updatePost(id, params.get("title"), params.get("content"), principal.getName());
        return ResponseEntity.ok("수정 성공");
    }

    // 5. 삭제: /api 추가
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @DeleteMapping("/api/community/posts/{id}/delete")
    public ResponseEntity<String> delete(@PathVariable Long id, Principal principal) {
        Users user = usersRepository.findByLoginId(principal.getName()).orElseThrow();
        communityPostService.deletePost(id, user);
        return ResponseEntity.ok("삭제 성공");
    }
}