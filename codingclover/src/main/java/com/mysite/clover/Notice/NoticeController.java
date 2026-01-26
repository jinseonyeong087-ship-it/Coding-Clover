package com.mysite.clover.Notice;

import java.security.Principal;
import java.util.List;

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
    public ResponseEntity<List<Notice>> getNoticeList() {
        // 일반 사용자는 VISIBLE인 것만
        return ResponseEntity.ok(noticeService.getVisibleNotices());
    }

    // 공지사항 상세
    // URL: /notice/{id}
    @GetMapping("/notice/{id}")
    public ResponseEntity<Notice> getNoticeDetail(@PathVariable Long id) {
        Notice notice = noticeService.getNotice(id);
        // 숨김 글인데 관리자가 아니면 차단하는 로직 등은 필요한 경우 추가
        return ResponseEntity.ok(notice);
    }

    // ==========================================
    // 🟥 관리자 영역
    // ==========================================

    // 관리자 공지 관리 (목록)
    // URL: /admin/notice
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/notice")
    public ResponseEntity<List<Notice>> getAdminNoticeList() {
        return ResponseEntity.ok(noticeService.getAllNotices());
    }

    // 관리자 공지 등록
    // URL: /admin/notice (POST) - url.md에 명시 안되어있으나 REST 관습 따름
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

    // DTO Class
    @Data
    public static class NoticeForm {
        private String title;
        private String content;
        private NoticeStatus status;
    }
}
