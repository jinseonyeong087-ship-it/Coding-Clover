package com.mysite.clover.Course;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.mysite.clover.Enrollment.EnrollmentRepository;
import com.mysite.clover.Users.Users;

// 강좌 서비스
@Service
public class CourseService {

    private final CourseRepository courseRepository = null;
    private final EnrollmentRepository enrollmentRepository = null;

    // 전체 강좌 목록 (관리자용)
    public List<Course> getList() {
        return courseRepository.findAll();
    }

    // 수강생 본인 강좌 목록 (전체)
    public List<Course> getStudentList(Users student) {
        return enrollmentRepository.findWithUserAndCourseByUser(student).stream()
                .map(com.mysite.clover.Enrollment.Enrollment::getCourse)
                .collect(java.util.stream.Collectors.toList());
    }

    // 수강중인 강좌
    public List<Course> getStudentActiveList(Users student) {
        return enrollmentRepository.findWithUserAndCourseByUser(student).stream()
                .filter(e -> e.getStatus() == com.mysite.clover.Enrollment.EnrollmentStatus.ENROLLED)
                .map(com.mysite.clover.Enrollment.Enrollment::getCourse)
                .collect(java.util.stream.Collectors.toList());
    }

    // 수강 완료 강좌
    public List<Course> getStudentCompletedList(Users student) {
        return enrollmentRepository.findWithUserAndCourseByUser(student).stream()
                .filter(e -> e.getStatus() == com.mysite.clover.Enrollment.EnrollmentStatus.COMPLETED)
                .map(com.mysite.clover.Enrollment.Enrollment::getCourse)
                .collect(java.util.stream.Collectors.toList());
    }

    // 승인 대기 강좌 목록 (관리자용)
    public List<Course> getPendingList() {
        return courseRepository.findByProposalStatus(CourseProposalStatus.PENDING);
    }

    // 공개된 강좌 목록 (승인됨)
    public List<Course> getPublicList() {
        return courseRepository.findByProposalStatus(CourseProposalStatus.APPROVED);
    }

    // 공개된 강좌 목록 (레벨별)
    public List<Course> getPublicListByLevel(int level) {
        return courseRepository.findByProposalStatusAndLevel(CourseProposalStatus.APPROVED, level);
    }

    // 강사별 강좌 목록
    public List<Course> getInstructorList(Users instructor) {
        return courseRepository.findByCreatedByUserId(instructor.getUserId());
    }

    // 강좌 생성
    public void create(
            String title,
            String description,
            int level,
            int price,
            Users user,
            CourseProposalStatus status) {
        Course course = new Course();
        course.setTitle(title);
        course.setDescription(description);
        course.setLevel(level);
        course.setPrice(price);
        course.setCreatedBy(user);
        course.setCreatedAt(LocalDateTime.now());
        course.setProposalStatus(status); // 강사 요청시 PENDING
        courseRepository.save(course);
    }

    // 강좌 조회
    public Course getCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("강좌 없음"));
    }

    // 승인
    public void approve(Course course, Users admin) {
        course.setProposalStatus(CourseProposalStatus.APPROVED);
        course.setApprovedBy(admin);
        course.setApprovedAt(LocalDateTime.now());
        courseRepository.save(course);
    }

    // 반려
    public void reject(Course course, String reason) {
        course.setProposalStatus(CourseProposalStatus.REJECTED);
        course.setProposalRejectReason(reason);
        courseRepository.save(course);
    }

    // 마감 (모집 종료)
    public void close(Course course) {
        course.setProposalStatus(CourseProposalStatus.CLOSED);
        courseRepository.save(course);
    }

    // 삭제
    public void delete(Course course) {
        courseRepository.delete(course);
    }
}
