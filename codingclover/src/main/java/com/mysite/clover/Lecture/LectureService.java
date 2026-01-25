package com.mysite.clover.Lecture;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class LectureService {

    private final LectureRepository lectureRepository;

    // 해당 강좌에 속한 모든 강의를 순서대로 조회 (강사용/관리자용, 상태 불문)
    public List<Lecture> getListByCourse(Course course) {
        return lectureRepository.findByCourseOrderByOrderNoAsc(course);
    }

    // 관리자용: 시스템에 등록된 모든 강의 목록 조회 (모든 상태 포함)
    public List<Lecture> getAllList() {
        return lectureRepository.findAll();
    }

    // 신규 강의 생성 및 저장 (강사가 업로드)
    public void create(
            Course course,
            String title,
            int orderNo,
            String videoUrl,
            int duration,
            Users instructor) {
        // 1. 강의 엔티티 생성
        Lecture lecture = new Lecture();

        // 2. 필드 값 설정
        lecture.setCourse(course);
        lecture.setTitle(title);
        lecture.setOrderNo(orderNo);
        lecture.setVideoUrl(videoUrl);
        lecture.setDuration(duration);
        lecture.setCreatedBy(instructor);
        lecture.setApprovalStatus(LectureApprovalStatus.PENDING); // 기본 상태는 승인 대기중
        lecture.setCreatedAt(LocalDateTime.now()); // 생성 시간

        // 3. DB 저장
        lectureRepository.save(lecture);
    }

    // 강의 ID로 단건 조회 (존재하지 않으면 예외 발생)
    public Lecture getLecture(Long id) {
        return lectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("강의 없음"));
    }

    // 관리자 기능: 강의 승인 처리
    public void approve(Lecture lecture, Users admin) {
        // 1. 상태를 승인됨(APPROVED)으로 변경
        lecture.setApprovalStatus(LectureApprovalStatus.APPROVED);
        // 2. 승인자 및 승인 시간 기록
        lecture.setApprovedBy(admin);
        lecture.setApprovedAt(LocalDateTime.now());

        // 3. 변경사항 저장
        lectureRepository.save(lecture);
    }

    // 관리자 기능: 강의 반려 처리
    public void reject(Lecture lecture, String reason) {
        // 1. 상태를 반려됨(REJECTED)으로 변경
        lecture.setApprovalStatus(LectureApprovalStatus.REJECTED);
        // 2. 반려 사유 기록
        lecture.setRejectReason(reason);

        // 3. 변경사항 저장
        lectureRepository.save(lecture);
    }

    // 강의 비활성화 (삭제 대신 상태 변경으로 데이터 보존)
    public void inactive(Lecture lecture) {
        // 1. 상태를 비활성(INACTIVE)으로 변경
        lecture.setApprovalStatus(LectureApprovalStatus.INACTIVE);
        // 2. 변경사항 저장
        lectureRepository.save(lecture);
    }

    // 승인 대기(PENDING) 상태인 강의 목록 조회 (관리자가 확인 후 승인하기 위해)
    public List<Lecture> getPendingList() {
        return lectureRepository.findByApprovalStatus(LectureApprovalStatus.PENDING);
    }

    // 수강생용: 특정 강좌의 '승인된(APPROVED)' 강의만 순서대로 조회
    public List<Lecture> getPublicListByCourse(Course course) {
        return lectureRepository.findByCourseAndApprovalStatusOrderByOrderNoAsc(course, LectureApprovalStatus.APPROVED);
    }

    // ID로 강의 조회 (컨트롤러 등에서 사용, 예외 메시지 구체화 메소드)
    public Lecture findById(Long id) {
        return lectureRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("강의를 찾을 수 없습니다."));
    }
}
