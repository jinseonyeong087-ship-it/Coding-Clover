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

// 커뮤니티 게시판 기능을 제공하는 컨트롤러
@RestController
@RequiredArgsConstructor
public class CommunityPostController {

    private final CommunityPostService communityPostService;
    private final UsersRepository usersRepository;

    // 1. 게시글 목록 조회
    // 인증된 사용자(학생, 관리자 등)라면 누구나 접근 가능 (보통 커뮤니티는 공개)
    // @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')") // 필요 시 주석 해제하여 권한 제한
    @GetMapping("/api/community/posts")
    public ResponseEntity<List<CommunityPost>> list(Principal principal) {
        // [DEBUG] 요청자 정보 로깅 (실제 운영 시에는 제거하거나 Logger 사용 권장)
        System.out.println("=== DEBUG: /api/community/posts ===");
        if (principal == null) {
            System.out.println("Principal is NULL (Anonymous)");
        } else {
            System.out.println("Principal Name: " + principal.getName());
            System.out.println("Authentication: "
                    + org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication());
        }

        // VISIBLE 상태인 게시글 목록을 조회하여 반환
        return ResponseEntity.ok(communityPostService.getVisiblePosts());
    }

    // 2. 게시글 상세 조회
    // 로그인한 사용자(학생, 관리자)만 접근 가능
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @GetMapping("/api/community/posts/{id}")
    public ResponseEntity<CommunityPost> detail(@PathVariable Long id) {
        // ID에 해당하는 게시글 상세 정보 반환
        return ResponseEntity.ok(communityPostService.getPost(id));
    }

    // 3. 게시글 등록
    // 학생(STUDENT) 권한만 등록 가능
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/api/community/posts/new")
    public ResponseEntity<String> create(@RequestBody Map<String, String> params, Principal principal) {
        // 로그인한 사용자(작성자) 정보 조회
        Users user = usersRepository.findByLoginId(principal.getName()).orElseThrow();

        // 게시글 등록 서비스 호출 (제목, 내용, 작성자)
        communityPostService.create(params.get("title"), params.get("content"), user);

        return ResponseEntity.ok("등록 성공");
    }

    // 4. 게시글 수정
    // 학생(STUDENT) 권한 필요 (서비스 내부에서 본인 확인 수행)
    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/api/community/posts/{id}/edit")
    public ResponseEntity<String> update(@PathVariable Long id, @RequestBody Map<String, String> params,
            Principal principal) {
        // 게시글 수정 서비스 호출 (ID, 제목, 내용, 요청자 로그인 ID)
        communityPostService.updatePost(id, params.get("title"), params.get("content"), principal.getName());

        return ResponseEntity.ok("수정 성공");
    }

    // 5. 게시글 삭제
    // 학생(작성자 본인) 또는 관리자만 삭제 가능
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @DeleteMapping("/api/community/posts/{id}/delete")
    public ResponseEntity<String> delete(@PathVariable Long id, Principal principal) {
        // 요청자 정보 조회
        Users user = usersRepository.findByLoginId(principal.getName()).orElseThrow();

        // 게시글 삭제 서비스 호출 (권한 체크는 서비스 내부에서 수행)
        communityPostService.deletePost(id, user);

        return ResponseEntity.ok("삭제 성공");
    }
}
