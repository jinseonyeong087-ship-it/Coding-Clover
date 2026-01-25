package com.mysite.clover.Lecture;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;

import lombok.RequiredArgsConstructor;

/**
 * 강의 서비스
 * 개별 강의 생성, 조회, 승인 관리 등의 비즈니스 로직을 처리합니다.
 * 강좌 내 강의의 순서 관리 및 공개 여부 필터링 등을 담당합니다.
 */
@RequiredArgsConstructor
@Service
public class LectureService {

    private final LectureRepository lectureRepository;

    // 해당 강좌에 속한 모든 강의를 순서대로 조회 (강사용/관리자용)
    public List<Lecture> getListByCourse(Course course) {
        return lectureRepository.findByCourseOrderByOrderNoAsc(course);
    }

    // 강의 생성
    public void create(
            Course course,
            String title,
            int orderNo,
            String videoUrl,
            int duration,
            Users instructor) {
        Lecture lecture = new Lecture();

        lecture.setCourse(course);
        lecture.setTitle(title);
        lecture.setOrderNo(orderNo);
        lecture.setVideoUrl(videoUrl);
        lecture.setDuration(duration);
        lecture.setCreatedBy(instructor);
        lecture.setApprovalStatus(LectureApprovalStatus.PENDING);
        lecture.setCreatedAt(LocalDateTime.now());

        lectureRepository.save(lecture);
    }

    // 강의 단건 조회
    public Lecture getLecture(Long id) {
        return lectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("강의 없음"));
    }

    // 강의 상태를 APPROVED로 변경하고 승인 정보를 기록

    public void approve(Lecture lecture, Users admin) {
        lecture.setApprovalStatus(LectureApprovalStatus.APPROVED);
        lecture.setApprovedBy(admin);
        lecture.setApprovedAt(LocalDateTime.now());
        lectureRepository.save(lecture);
    }

    // 강의 상태를 REJECTED로 변경하고 반려 사유를 기록
    public void reject(Lecture lecture, String reason) {
        lecture.setApprovalStatus(LectureApprovalStatus.REJECTED);
        lecture.setRejectReason(reason);
        lectureRepository.save(lecture);
    }

    // 강의 상태를 INACTIVE로 변경
    public void inactive(Lecture lecture) {
        lecture.setApprovalStatus(LectureApprovalStatus.INACTIVE);
        lectureRepository.save(lecture);
    }

    // 승인 대기 'PENDING' 상태인 강의 목록을 반환
    public List<Lecture> getPendingList() {
        return lectureRepository.findByApprovalStatus(LectureApprovalStatus.PENDING);
    }

    // 공개된 강의 목록 조회 특정 강좌의 'APPROVED' 상태인 강의만 조회. (수강생용)
    public List<Lecture> getPublicListByCourse(Course course) {
        return lectureRepository.findByCourseAndApprovalStatusOrderByOrderNoAsc(course, LectureApprovalStatus.APPROVED);
    }

    // ID로 강의 조회 (컨트롤러용)
    public Lecture findById(Long id) {
        return lectureRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("강의를 찾을 수 없습니다."));
    }
}
