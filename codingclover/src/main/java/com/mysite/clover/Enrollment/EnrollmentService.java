package com.mysite.clover.Enrollment;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseRepository;
import com.mysite.clover.Users.Users;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

  private final EnrollmentRepository enrollmentRepository;
  private final CourseRepository courseRepository;

  @Transactional
  public void enroll(Users user, Course course) {

    // 중복강좌 검증
    boolean alreadyEnrolled = enrollmentRepository.existsByUserAndCourseAndStatus(
        user,
        course,
        EnrollmentStatus.ENROLLED);
    // 수강중이라면 익셉션
    if (alreadyEnrolled) {
      throw new IllegalStateException("이미 수강 중인 강좌입니다.");
    }

    Enrollment enrollment = new Enrollment(user, course);
    enrollmentRepository.save(enrollment);
  }

  // 수강 취소(actor가 수강 취소 행위자)
  @Transactional
  public void cancel(Users actor, Users user, Course course) {

    Enrollment enrollment = enrollmentRepository
        .findByUserAndCourseAndStatus(
            user, course, EnrollmentStatus.ENROLLED)
        .orElseThrow(() -> new IllegalStateException("수강 중인 정보가 없습니다."));

    enrollment.cancel(actor);
  }

  // 수강 완료 처리
  @Transactional
  public void complete(Users user, Course course) {

    Enrollment enrollment = enrollmentRepository
        .findByUserAndCourseAndStatus(
            user, course, EnrollmentStatus.ENROLLED)
        .orElseThrow(() -> new IllegalStateException("수강 중인 정보가 없습니다."));

    enrollment.complete();
  }

  // 수강 목록 조회
  @Transactional(readOnly = true)
  public List<Enrollment> getMyEnrollments(Users user) {
    return enrollmentRepository.findWithUserAndCourseByUser(user);
  }

  // === 학생용 메소드 ===

  // 학생 - 내 수강 내역 조회
  @Transactional(readOnly = true)
  public List<StudentEnrollmentDto> getMyEnrollmentsForStudent(Users student) {
    List<Enrollment> enrollments = enrollmentRepository.findWithUserAndCourseByUser(student);
    return enrollments.stream()
        .map(e -> new StudentEnrollmentDto(
            e.getEnrollmentId(),
            e.getCourse().getCourseId(),
            e.getCourse().getTitle(),
            e.getEnrolledAt(),
            e.getStatus()
        ))
        .collect(Collectors.toList());
  }

  // 학생 - 강좌 수강 신청
  @Transactional
  public void enrollCourse(Users student, Long courseId) {
    Course course = courseRepository.findById(courseId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강좌입니다."));
    enroll(student, course);
  }

  // 학생 - 내 수강 취소
  @Transactional
  public void cancelMyEnrollment(Users student, Long courseId) {
    Course course = courseRepository.findById(courseId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강좌입니다."));
    cancel(student, student, course);
  }

  // === 강사용 메소드 ===

  // 강사 - 특정 강좌의 수강생 조회
  @Transactional(readOnly = true)
  public List<InstructorEnrollmentDto> getCourseStudents(Users instructor, Long courseId) {
    Course course = courseRepository.findById(courseId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강좌입니다."));
    
    List<Enrollment> enrollments = enrollmentRepository.findByInstructorAndCourse(instructor, course);
    return enrollments.stream()
        .map(e -> new InstructorEnrollmentDto(
            e.getEnrollmentId(),
            e.getUser().getUserId(),
            e.getUser().getName(),
            e.getEnrolledAt(),
            e.getStatus()
        ))
        .collect(Collectors.toList());
  }

  // 강사 - 내 모든 강좌의 수강생 조회
  @Transactional(readOnly = true)
  public List<InstructorEnrollmentDto> getMyAllCourseStudents(Users instructor) {
    List<Enrollment> enrollments = enrollmentRepository.findByInstructor(instructor);
    return enrollments.stream()
        .map(e -> new InstructorEnrollmentDto(
            e.getEnrollmentId(),
            e.getUser().getUserId(),
            e.getUser().getName(),
            e.getEnrolledAt(),
            e.getStatus()
        ))
        .collect(Collectors.toList());
  }

  // === 관리자용 메소드 ===

  // 관리자 - 전체 수강 내역 조회
  @Transactional(readOnly = true)
  public List<AdminEnrollmentDto> getAllEnrollments() {
    List<Enrollment> enrollments = enrollmentRepository.findAllWithUserAndCourse();
    return enrollments.stream()
        .map(e -> new AdminEnrollmentDto(
            e.getEnrollmentId(),
            e.getUser().getUserId(),
            e.getUser().getName(),
            e.getCourse().getCourseId(),
            e.getCourse().getTitle(),
            e.getEnrolledAt(),
            e.getStatus(),
            e.getCancelledBy() != null ? e.getCancelledBy().getUserId() : null
        ))
        .collect(Collectors.toList());
  }

  // 관리자 - 수강 취소 (관리자 권한)
  @Transactional
  public void adminCancelEnrollment(Users admin, Long enrollmentId) {
    Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수강 정보입니다."));
    
    if (enrollment.getStatus() != EnrollmentStatus.ENROLLED) {
      throw new IllegalStateException("수강 중인 상태가 아닙니다.");
    }
    
    enrollment.cancel(admin);
  }

  // 관리자 - 특정 강좌의 수강생 조회
  @Transactional(readOnly = true)
  public List<AdminEnrollmentDto> getAdminCourseStudents(Long courseId) {
    Course course = courseRepository.findById(courseId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강좌입니다."));
        
    List<Enrollment> enrollments = enrollmentRepository.findAdminByCourse(course);
    return enrollments.stream()
        .map(e -> new AdminEnrollmentDto(
            e.getEnrollmentId(),
            e.getUser().getUserId(),
            e.getUser().getName(),
            e.getCourse().getCourseId(),
            e.getCourse().getTitle(),
            e.getEnrolledAt(),
            e.getStatus(),
            e.getCancelledBy() != null ? e.getCancelledBy().getUserId() : null
        ))
        .collect(Collectors.toList());
  }
}
