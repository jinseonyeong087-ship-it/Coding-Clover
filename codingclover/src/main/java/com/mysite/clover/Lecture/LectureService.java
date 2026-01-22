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

    /**
     * 강좌별 전체 강의 목록 조회
     * 해당 강좌에 속한 모든 강의를 순서대로 조회합니다. (강사용/관리자용)
     * 
     * @param course 강좌
     * @return 강의 목록
     */
    public List<Lecture> getListByCourse(Course course) {
        return lectureRepository.findByCourseOrderByOrderNoAsc(course);
    }

    /**
     * 강의 생성
     * 새로운 강의를 생성합니다. 초기 상태는 PENDING 입니다.
     * 
     * @param course     강좌
     * @param title      강의 제목
     * @param orderNo    순서
     * @param videoUrl   영상 URL
     * @param duration   재생 시간
     * @param instructor 등록 강사
     */
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
        lecture.setApprovalStatus("PENDING");
        lecture.setCreatedAt(LocalDateTime.now());

        lectureRepository.save(lecture);
    }

    /**
     * 강의 단건 조회
     * ID로 강의를 조회하며, 존재하지 않을 경우 예외가 발생합니다.
     * 
     * @param id 강의 ID
     * @return 조회된 강의
     */
    public Lecture getLecture(Long id) {
        return lectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("강의 없음"));
    }

    /**
     * 강의 승인
     * 강의 상태를 APPROVED로 변경하고 승인 정보를 기록합니다.
     * 
     * @param lecture 대상 강의
     * @param admin   승인한 관리자
     */
    public void approve(Lecture lecture, Users admin) {
        lecture.setApprovalStatus("APPROVED");
        lecture.setApprovedBy(admin);
        lecture.setApprovedAt(LocalDateTime.now());
        lectureRepository.save(lecture);
    }

    /**
     * 강의 반려
     * 강의 상태를 REJECTED로 변경하고 반려 사유를 기록합니다.
     * 
     * @param lecture 대상 강의
     * @param reason  반려 사유
     */
    public void reject(Lecture lecture, String reason) {
        lecture.setApprovalStatus("REJECTED");
        lecture.setRejectReason(reason);
        lectureRepository.save(lecture);
    }

    /**
     * 강의 비활성화
     * 강의 상태를 INACTIVE로 변경합니다.
     * 
     * @param lecture 대상 강의
     */
    public void inactive(Lecture lecture) {
        lecture.setApprovalStatus("INACTIVE");
        lectureRepository.save(lecture);
    }

    /**
     * 승인 대기 강의 목록 조회
     * 'PENDING' 상태인 강의 목록을 반환합니다.
     * 
     * @return 승인 대기 강의 목록
     */
    public List<Lecture> getPendingList() {
        return lectureRepository.findByApprovalStatus("PENDING");
    }

    /**
     * 공개된 강의 목록 조회
     * 특정 강좌의 'APPROVED' 상태인 강의만 조회합니다. (수강생용)
     * 
     * @param course 강좌
     * @return 공개된 강의 목록
     */
    public List<Lecture> getPublicListByCourse(Course course) {
        // 기존 getListByCourse는 강사용(전체)이고, 학생용은 APPROVE 된 것만
        // Repository에 메소드 추가 필요할 수 있음. 일단 스트림으로 처리하거나 Repository 추가.
        // Repository에 findByCourseAndApprovalStatusOrderByOrderNoAsc 추가 권장.
        return lectureRepository.findByCourseAndApprovalStatusOrderByOrderNoAsc(course, "APPROVED");
    }
}
