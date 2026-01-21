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

    // 강좌별 강의 목록
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
            Users instructor
    ) {
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

    // 강의 단건 조회
    public Lecture getLecture(Long id) {
        return lectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("강의 없음"));
    }

    // 관리자 승인
    public void approve(Lecture lecture, Users admin) {
        lecture.setApprovalStatus("APPROVED");
        lecture.setApprovedBy(admin);
        lecture.setApprovedAt(LocalDateTime.now());
        lectureRepository.save(lecture);
    }

    // 관리자 반려
    public void reject(Lecture lecture, String reason) {
        lecture.setApprovalStatus("REJECTED");
        lecture.setRejectReason(reason);
        lectureRepository.save(lecture);
    }

    // 관리자 비활성화
    public void inactive(Lecture lecture) {
        lecture.setApprovalStatus("INACTIVE");
        lectureRepository.save(lecture);
    }
}
