package com.mysite.clover.Course;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // jakarta 대신 spring꺼 권장

import com.mysite.clover.Enrollment.Enrollment;
import com.mysite.clover.Enrollment.EnrollmentRepository;
import com.mysite.clover.Enrollment.EnrollmentStatus;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository; // 추가됨

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UsersRepository usersRepository; // 1. 이게 누락되어 에러가 났던 것입니다.

    // ==========================================
    // 🟦 조회 및 관리 로직
    // ==========================================

    public List<Course> getList() {
        return courseRepository.findAll();
    }

    public List<Course> getStudentList(Users student) {
        return enrollmentRepository.findWithUserAndCourseByUser(student).stream()
                .map(Enrollment::getCourse)
                .collect(Collectors.toList());
    }

    public List<Course> getPendingList() {
        return courseRepository.findByProposalStatus(CourseProposalStatus.PENDING);
    }

    public List<Course> getPublicList() {
        return courseRepository.findByProposalStatus(CourseProposalStatus.APPROVED);
    }

    public List<Course> getPublicListByLevel(int level) {
        return courseRepository.findByProposalStatusAndLevel(CourseProposalStatus.APPROVED, level);
    }

    public List<Course> getInstructorList(Users instructor) {
        return courseRepository.findByCreatedByUserId(instructor.getUserId());
    }

    public Course getCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("강좌 없음"));
    }

    // ==========================================
    // 🟩 강사 기능 (생성 / 수정 / 삭제)
    // ==========================================

    @Transactional
    public void create(String title, String description, int level, int price, Users user, CourseProposalStatus status) {
        Course course = new Course();
        course.setTitle(title);
        course.setDescription(description);
        course.setLevel(level);
        course.setPrice(price);
        course.setCreatedBy(user);
        course.setCreatedAt(LocalDateTime.now());
        course.setProposalStatus(status);
        courseRepository.save(course);
    }

    @Transactional
    public void update(Long id, String title, String description, int level, int price) {
        Course course = getCourse(id);
        course.setTitle(title);
        course.setDescription(description);
        course.setLevel(level);
        course.setPrice(price);
        // Dirty Check로 자동 저장됨
    }

    @Transactional
    public void delete(Course course) {
        courseRepository.delete(course);
    }

    // ==========================================
    // 🟨 수강 신청 기능 (DB 저장 핵심)
    // ==========================================

    @Transactional // 2. 이 어노테이션이 있어야 실제 DB에 Commit이 됩니다.
    public void enroll(Long courseId, String loginId) {
        // 유저 정보 조회
        Users user = usersRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 강좌 정보 조회
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("강좌를 찾을 수 없습니다."));

        // 수강 신청 데이터 생성 및 저장
        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setEnrolledAt(LocalDateTime.now());
        
        // 주의: 프로젝트의 EnrollStatus 상숫값이 ACTIVE인지 ENROLLED인지 확인 후 맞추세요.
        enrollment.setStatus(EnrollmentStatus.ENROLLED);

        enrollmentRepository.save(enrollment); 
    }

    // ==========================================
    // 🟥 관리자 기능 (승인 / 반려)
    // ==========================================

    @Transactional
    public void approve(Course course, Users admin) {
        course.setProposalStatus(CourseProposalStatus.APPROVED);
        course.setApprovedBy(admin);
        course.setApprovedAt(LocalDateTime.now());
        courseRepository.save(course);
    }

    @Transactional
    public void reject(Course course, String reason) {
        course.setProposalStatus(CourseProposalStatus.REJECTED);
        course.setProposalRejectReason(reason);
        courseRepository.save(course);
    }
}