package com.mysite.clover.Course;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mysite.clover.Enrollment.Enrollment;
import com.mysite.clover.Enrollment.EnrollmentRepository;
import com.mysite.clover.Enrollment.EnrollmentStatus;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UsersRepository usersRepository;

    // [조회 로직]
    public List<Course> getList() {
        return courseRepository.findAll();
    }

    // 승인 대기중인 강좌 목록 조회
    public List<Course> getPendingList() {
        return courseRepository.findByProposalStatus(CourseProposalStatus.PENDING);
    }

    // 승인된 강좌 목록 조회
    public List<Course> getPublicList() {
        return courseRepository.findByProposalStatus(CourseProposalStatus.APPROVED);
    }

    // 승인된 강좌 목록 조회 (레벨별)
    public List<Course> getPublicListByLevel(int level) {
        return courseRepository.findByProposalStatusAndLevel(CourseProposalStatus.APPROVED, level);
    }

    // 강사의 강좌 목록 조회
    public List<Course> getInstructorList(Users instructor) {
        return courseRepository.findByCreatedByUserId(instructor.getUserId());
    }

    // 강좌 조회
    public Course getCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("강좌 없음"));
    }

    // [강사 기능: 생성/수정/삭제]
    @Transactional
    public void create(String title, String description, int level, int price, Users user,
            CourseProposalStatus status) {
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

    // 강좌 수정
    @Transactional
    public void update(Long id, String title, String description, int level, int price) {
        Course course = getCourse(id);
        course.setTitle(title);
        course.setDescription(description);
        course.setLevel(level);
        course.setPrice(price);
    }

    // 강좌 삭제
    @Transactional
    public void delete(Course course) {
        courseRepository.delete(course);
    }

    // 수강생 조회
    public List<Course> getStudentList(Users student) {
        return enrollmentRepository.findWithUserAndCourseByUser(student).stream()
                .map(Enrollment::getCourse)
                .collect(Collectors.toList());
    }

    // 수강 신청
    @Transactional
    public void enroll(Long courseId, String loginId) {
        Users user = usersRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Course course = courseRepository.findById(courseId) // ID로 Course 객체 확보
                .orElseThrow(() -> new RuntimeException("강좌를 찾을 수 없습니다."));

        // 중복 체크 로직
        if (enrollmentRepository.existsByUserAndCourseAndStatus(user, course, EnrollmentStatus.ENROLLED)) {
            throw new RuntimeException("이미 수강 중인 강좌입니다.");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setStatus(EnrollmentStatus.ENROLLED);

        enrollmentRepository.save(enrollment);
    }

    // 수강생 조회
    public List<Users> getEnrolledStudents(Long courseId) {
        Course course = getCourse(courseId); // 먼저 Course 객체를 가져옴
        return enrollmentRepository.findAdminByCourse(course).stream()
                .map(Enrollment::getUser)
                .collect(Collectors.toList());
    }

    // 관리자 승인
    @Transactional
    public void approve(Course course, Users admin) {
        course.setProposalStatus(CourseProposalStatus.APPROVED);
        course.setApprovedBy(admin);
        course.setApprovedAt(LocalDateTime.now());
        courseRepository.save(course);
    }

    // 관리자 반려
    @Transactional
    public void reject(Course course, String reason) {
        course.setProposalStatus(CourseProposalStatus.REJECTED);
        course.setProposalRejectReason(reason);
        courseRepository.save(course);
    }
}