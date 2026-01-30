package com.mysite.clover.Lecture;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Lecture.dto.LectureCreateRequest;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class LectureService {

    private final LectureRepository lectureRepository;
    private final UsersRepository usersRepository;

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
            Users instructor,
            LectureUploadType uploadType,
            LocalDateTime scheduledAt) {

        // [중복 검사] DB 제약조건 대신 애플리케이션 레벨에서 막기
        if (lectureRepository.existsByCourseCourseIdAndOrderNo(course.getCourseId(), orderNo)) {
            throw new IllegalArgumentException("이미 존재하는 순서입니다.");
        }

        // 1. 강의 엔티티 생성
        Lecture lecture = new Lecture();

        // 2. 필드 값 설정
        lecture.setCourse(course);
        lecture.setTitle(title);
        lecture.setOrderNo(orderNo);
        lecture.setVideoUrl(videoUrl);
        lecture.setDuration(duration);
        lecture.setCreatedBy(instructor);

        // 승인 대기 상태 및 생성 시간 설정 (중복 코드 제거됨)
        lecture.setApprovalStatus(LectureApprovalStatus.PENDING);
        lecture.setCreatedAt(LocalDateTime.now());

        lecture.setUploadType(uploadType);
        lecture.setScheduledAt(scheduledAt);

        // 3. DB 저장
        lectureRepository.save(lecture);
    }

    // 강의 ID로 단건 조회 (존재하지 않으면 예외 발생)
    public Lecture getLecture(Long id) {
        return lectureRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다. ID: " + id));
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

    // 일괄 승인
    @Transactional
    public void approveMultiple(List<Long> ids, Users admin) {
        for (Long id : ids) {
            // 강의 ID로 강의 조회
            Lecture lecture = lectureRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("강의를 찾을 수 없습니다. ID: " + id));

            // 기존에 만든 단건 승인 로직(approve)을 재사용
            approve(lecture, admin);
        }
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

    // 일괄 반려
    @Transactional
    public void rejectMultiple(List<Long> ids, String reason) {
        // 반려 사유가 없으면 예외 발생
        if (reason == null || reason.trim().isEmpty()) {
            // TODO: 프론트엔드에서 반려 사유를 입력받도록 수정 후 이 부분 삭제
            throw new IllegalArgumentException("반려 사유를 입력해야 합니다.");
        }

        // 선택된 강의 ID를 순회하며 반려 처리
        for (Long id : ids) {
            // 강의 ID로 강의 조회
            Lecture lecture = lectureRepository.findById(id)
                    // 없으면 예외 발생
                    .orElseThrow(() -> new IllegalArgumentException("강의를 찾을 수 없습니다. ID: " + id));

            // 기존에 만든 단건 반려 로직(reject)을 재사용
            reject(lecture, reason);
        }
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

    // 학생용: 특정 강좌의 '공개 가능한' 강의만 순서대로 조회
    public List<Lecture> getLecturesForStudent(Course course) {
        // 학생에게는 '공개 가능한' 강의만 필터링해서 반환
        return lectureRepository.findVisibleLecturesByCourseId(course);
    }

    // 강의 재제출 (반려된 강의 수정 후 재요청)
    public void resubmitLecture(Long lectureId, LectureCreateRequest updateDto, String loginId) {
        // 1. 기존 강의 조회
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다."));

        // 2. 권한 체크 (강좌 작성자와 현재 로그인 사용자가 일치하는지)
        if (!lecture.getCourse().getCreatedBy().getLoginId().equals(loginId)) {
            throw new SecurityException("수정 권한이 없습니다.");
        }

        // 3. 필드 업데이트
        lecture.setTitle(updateDto.getTitle());
        lecture.setOrderNo(updateDto.getOrderNo());
        lecture.setVideoUrl(updateDto.getVideoUrl());
        lecture.setDuration(updateDto.getDuration());
        lecture.setUploadType(updateDto.getUploadType());
        // 예약 시간 설정
        lecture.setScheduledAt(updateDto.getUploadType() == LectureUploadType.RESERVED
                ? updateDto.getScheduledAt()
                : null);

        // 4. 상태 초기화
        // 강의 상태를 PENDING으로 변경하여 관리자 화면에 다시 노출
        lecture.setApprovalStatus(LectureApprovalStatus.PENDING);
        // 반려 사유 필드 초기화
        lecture.setRejectReason(null);

        // 5. 변경사항 저장
        lectureRepository.save(lecture);
    }

    // 강좌 ID로 강의 목록 조회
    public List<Lecture> getLecturesByCourseId(Long courseId) {
        return lectureRepository.findByCourse_CourseIdOrderByOrderNoAsc(courseId);
    }
}
