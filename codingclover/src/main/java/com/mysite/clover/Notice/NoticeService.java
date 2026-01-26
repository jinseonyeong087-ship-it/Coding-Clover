package com.mysite.clover.Notice;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mysite.clover.DataNotFoundException;
import com.mysite.clover.Users.Users;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    // 공지사항 목록 (사용자용 - VISIBLE만)
    @Transactional(readOnly = true)
    public List<Notice> getVisibleNotices() {
        return noticeRepository.findByStatusOrderByCreatedAtDesc(NoticeStatus.VISIBLE);
    }

    // 공지사항 상세 (사용자용)
    @Transactional(readOnly = true)
    public Notice getNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("공지사항을 찾을 수 없습니다."));

        // 사용자는 숨김 처리된 글을 볼 수 없다고 가정 (필요시 정책 변경)
        if (notice.getStatus() == NoticeStatus.HIDDEN) {
            // 관리자 로직이 아니라면 예외 발생 가능, 일단 여기선 조회함
            // Controller에서 권한 체크하거나 여기서직접 처리
        }
        return notice;
    }

    // 관리자 공지 생성
    @Transactional
    public Notice create(String title, String content, Users admin, NoticeStatus status) {
        Notice notice = new Notice();
        notice.setTitle(title);
        notice.setContent(content);
        notice.setCreatedBy(admin);
        notice.setStatus(status);
        return noticeRepository.save(notice);
    }

    // 관리자 공지 수정
    @Transactional
    public Notice update(Long id, String title, String content, NoticeStatus status) {
        Notice notice = getNotice(id); // 재사용
        notice.setTitle(title);
        notice.setContent(content);
        notice.setStatus(status);
        return noticeRepository.save(notice);
    }

    // 관리자 공지 삭제
    @Transactional
    public void delete(Long id) {
        Notice notice = getNotice(id);
        noticeRepository.delete(notice);
    }

    // 관리자 전체 목록
    @Transactional(readOnly = true)
    public List<Notice> getAllNotices() {
        return noticeRepository.findAllByOrderByCreatedAtDesc();
    }
}
