package com.mysite.clover.Enrollment;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Payment.PaymentService;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

/*수강 관련 비즈니스 로직 처리 */
@Service
@RequiredArgsConstructor
public class EnrollmentService {

  private final EnrollmentRepository enrollmentRepository;
  private final PaymentService paymentService;

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

  // 학생 - 내 수강 내역 조회 (취소된 수강은 제외)
  @Transactional(readOnly = true)
  public List<StudentEnrollmentDto> getMyEnrollmentsForStudent(Users student) {
    List<Enrollment> enrollments = enrollmentRepository.findWithUserAndCourseByUser(student);
    return enrollments.stream()
        .filter(e -> e.getStatus() != EnrollmentStatus.CANCELLED) // 취소된 수강은 마이페이지에서 제외
        .map(e -> new StudentEnrollmentDto(
            e.getEnrollmentId(),
            e.getCourse().getCourseId(),
            e.getCourse().getTitle(),
            e.getEnrolledAt(),
            e.getStatus()
        ))
        .collect(Collectors.toList());
  }

  // 학생 - 내 수강 취소 (즉시 포인트 환불)
  @Transactional
  public void cancelMyEnrollment(Users student, Course course) {
    System.out.println("=== 수강취소 시작 ===");
    System.out.println("학생 ID: " + student.getUserId() + ", 강좌 ID: " + course.getCourseId() + ", 가격: " + course.getPrice());
    
    // 1. 수강 상태를 취소로 변경
    cancel(student, student, course);
    System.out.println("수강 상태 취소 완료");
    
    // 2. 해당 수강 신청 시 사용한 결제내역을 찾아서 자동 환불 처리
    try {
      System.out.println("환불 처리 시작...");
      
      // 강좌 가격만큼 즉시 포인트 환불 (강좌에서 가격 가져오기) 
      paymentService.processDirectRefund(
          student.getUserId(), 
          course.getPrice(), 
          "수강취소 - " + course.getTitle()
      );
      
      System.out.println("환불 처리 성공: " + course.getPrice() + "P");
      
    } catch (Exception e) {
      // 환불 처리 실패 시에도 수강 취소는 유지 (로그만 남김)
      System.err.println("수강취소 환불 처리 실패: " + e.getMessage());
      e.printStackTrace(); // 전체 에러 스택 출력
      
      // 환불 실패 시 예외를 다시 던져서 전체 트랜잭션 롤백
      throw new RuntimeException("환불 처리 실패: " + e.getMessage(), e);
    }
    
    System.out.println("=== 수강취소 완료 ===");
  }

  // === 강사용 메소드 ===

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
  //Enrollment + User + Course를 한 번에 조회
  public List<AdminEnrollmentDto> getAllEnrollments() {
    List<Enrollment> enrollments = enrollmentRepository.findAllWithUserAndCourse();
    //Enrollment 리스트 → AdminEnrollmentDto 리스트로 변환
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
  public List<AdminEnrollmentDto> getAdminCourseStudents(Course course) {
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
