package com.mysite.clover.Notice;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;
    private final UsersRepository usersRepository;

    // ==========================================
    // 🟦 공통 (비로그인/로그인)
    // ==========================================

    // 공지사항 목록
    // URL: /notice
    @GetMapping("/notice")
    public ResponseEntity<List<NoticeResponse>> getNoticeList() {
        System.out.println("DEBUG: Requesting User Notice List");
        List<Notice> notices = noticeService.getVisibleNotices();
        System.out.println("DEBUG: Found " + notices.size() + " visible notices.");
        if (!notices.isEmpty()) {
            System.out.println("DEBUG: First notice status: " + notices.get(0).getStatus());
        }

        List<NoticeResponse> response = notices.stream()
                .map(NoticeResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // 공지사항 상세
    // URL: /notice/{id}
    @GetMapping("/notice/{id}")
    public ResponseEntity<NoticeResponse> getNoticeDetail(@PathVariable Long id) {
        Notice notice = noticeService.getNotice(id);
        return ResponseEntity.ok(new NoticeResponse(notice));
    }

    // ==========================================
    // 🟥 관리자 영역
    // ==========================================

    // 관리자 공지 관리 (목록)
    // URL: /admin/notice
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/notice")
    public ResponseEntity<List<NoticeResponse>> getAdminNoticeList() {
        List<Notice> notices = noticeService.getAllNotices();
        List<NoticeResponse> response = notices.stream()
                .map(NoticeResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // 관리자 공지 등록
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/notice")
    public ResponseEntity<String> createNotice(@RequestBody NoticeForm form, Principal principal) {
        Users admin = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        noticeService.create(form.getTitle(), form.getContent(), admin,
                form.getStatus() != null ? form.getStatus() : NoticeStatus.VISIBLE);

        return ResponseEntity.ok("공지사항이 등록되었습니다.");
    }

    // 관리자 공지 수정
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/notice/{id}")
    public ResponseEntity<String> updateNotice(@PathVariable Long id, @RequestBody NoticeForm form) {
        noticeService.update(id, form.getTitle(), form.getContent(), form.getStatus());
        return ResponseEntity.ok("공지사항이 수정되었습니다.");
    }

    // 관리자 공지 삭제
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/notice/{id}")
    public ResponseEntity<String> deleteNotice(@PathVariable Long id) {
        noticeService.delete(id);
        return ResponseEntity.ok("공지사항이 삭제되었습니다.");
    }

    // ==========================================
    // DTO Classes
    // ==========================================

    @Data
    public static class NoticeResponse {
        private Long noticeId;
        private String title;
        private String content;
        private String authorName;
        private String authorLoginId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private NoticeStatus status;

        public NoticeResponse(Notice notice) {
            this.noticeId = notice.getNoticeId();
            this.title = notice.getTitle();
            this.content = notice.getContent();
            if (notice.getCreatedBy() != null) {
                this.authorName = notice.getCreatedBy().getName();
                this.authorLoginId = notice.getCreatedBy().getLoginId();
            }
            this.createdAt = notice.getCreatedAt();
            this.updatedAt = notice.getUpdatedAt();
            this.status = notice.getStatus();
        }
    }

    @Data
    public static class NoticeForm {
        private String title;
        private String content;
        private NoticeStatus status;
    }
}
