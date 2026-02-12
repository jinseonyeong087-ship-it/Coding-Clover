package com.mysite.clover.Enrollment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Lecture.LectureService;
import com.mysite.clover.LectureProgress.LectureProgressRepository;
import com.mysite.clover.Notification.NotificationService;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRole;
import com.mysite.clover.Users.UsersRepository;
import com.mysite.clover.Payment.PaymentService;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

/*수강 관련 비즈니스 로직 처리 */
@Service
@RequiredArgsConstructor
public class EnrollmentService {

  private final EnrollmentRepository enrollmentRepository;
  private final PaymentService paymentService;
  private final LectureProgressRepository lectureProgressRepository;
  private final LectureService lectureService;
  private final NotificationService notificationService;
  private final UsersRepository usersRepository;

  @Transactional
  public void enroll(Users user, Course course) {
    System.out.println("=== 수강신청 시작 ===");
    System.out.println("사용자 ID: " + user.getUserId() + ", 강좌 ID: " + course.getCourseId());

    // 이미 수강중인지 확인
    boolean alreadyEnrolled = enrollmentRepository.existsByUserAndCourseAndStatus(
        user,
        course,
        EnrollmentStatus.ENROLLED);

    System.out.println("이미 수강중 여부: " + alreadyEnrolled);
    if (alreadyEnrolled) {
      throw new IllegalStateException("이미 수강 중인 강좌입니다.");
    }

    // 해당 사용자-강좌 레코드가 존재하는지 확인
    boolean recordExists = enrollmentRepository.existsByUserAndCourse(user, course);
    System.out.println("기존 레코드 존재 여부: " + recordExists);

    if (recordExists) {
      System.out.println("기존 레코드가 존재함 - UPDATE 시도");
      // 기존 레코드가 있으면 취소된 수강을 재활성화 시도
      int updatedRows = enrollmentRepository.reactivateEnrollment(
          user,
          course,
          EnrollmentStatus.CANCELLED,
          EnrollmentStatus.ENROLLED,
          LocalDateTime.now());

      System.out.println("UPDATE된 행 수: " + updatedRows);
      if (updatedRows == 0) {
        // UPDATE가 실패했다면 이미 다른 상태(완료 등)인 레코드가 존재
        throw new IllegalStateException("해당 강좌의 수강 내역이 이미 처리되었습니다.");
      } else {
        System.out.println("=== 수강신청 완료 (재활성화) ===");
      }
    } else {
      System.out.println("기존 레코드가 없음 - INSERT 시도");
      // 레코드가 없으면 새로운 수강 등록
      Enrollment enrollment = new Enrollment(user, course);
      enrollmentRepository.save(enrollment);
      System.out.println("=== 수강신청 완료 (신규) ===");
    }
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
            e.getStatus()))
        .collect(Collectors.toList());
  }

  // 학생 - 내 수강 취소 (즉시 포인트 환불)
  @Transactional
  public void cancelMyEnrollment(Users student, Course course) {
    System.out.println("=== 수강취소 시작 ===");
    System.out
        .println("학생 ID: " + student.getUserId() + ", 강좌 ID: " + course.getCourseId() + ", 가격: " + course.getPrice());

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
          "수강취소 - " + course.getTitle());

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

  // 학생 - 수강 취소 요청
  @Transactional
  public CancelRequestDto requestCancel(Users student, Enrollment enrollment) {
    if (enrollment.getUser().getUserId() != student.getUserId()) {
      throw new IllegalStateException("요청 권한이 없습니다.");
    }

    // 요청 전 상태 로깅
    System.out.println("=== 취소 요청 전 상태 ===");
    System.out.println("Enrollment ID: " + enrollment.getEnrollmentId());
    System.out.println("Before request - cancelledAt: " + enrollment.getCancelledAt());
    System.out.println("Before request - isCancelRequested: " + enrollment.isCancelRequested());
    System.out.println("Before request - status: " + enrollment.getStatus());

    if (enrollment.isCancelRequested()) {
      System.out.println("ERROR: 이미 처리 대기중인 취소 요청이 있습니다.");
      throw new IllegalStateException("이미 처리 대기중인 취소 요청이 있습니다.");
    }

    if (enrollment.getStatus() != EnrollmentStatus.ENROLLED) {
      System.out.println("ERROR: 수강 중인 강좌만 취소 요청이 가능합니다. 현재 상태: " + enrollment.getStatus());
      throw new IllegalStateException("수강 중인 강좌만 취소 요청이 가능합니다.");
    }

    enrollment.requestCancel();

    // 요청 후 상태 로깅
    System.out.println("After request - cancelledAt: " + enrollment.getCancelledAt());
    System.out.println("After request - isCancelRequested: " + enrollment.isCancelRequested());

    enrollmentRepository.save(enrollment);

    // 관리자에게 알림 전송
    try {
      List<Users> admins = usersRepository.findByRole(UsersRole.ADMIN);
      String notificationMessage = String.format("%s 님이 %s 강좌의 수강 취소를 요청했습니다.",
          student.getName(), enrollment.getCourse().getTitle());

      for (Users admin : admins) {
        notificationService.createNotification(
            admin,
            "CANCEL_REQUEST",
            notificationMessage,
            "/admin/students/" + student.getUserId() // 관리자 학생 상세 페이지로 이동
        );
      }
    } catch (Exception e) {
      System.err.println("관리자 알림 전송 실패: " + e.getMessage());
      // 알림 전송 실패가 로직 실패로 이어지지는 않도록 함
    }

    System.out.println("=== 취소 요청 완료 ===");
    return toCancelRequestDto(enrollment);
  }

  // 학생 - 내 취소 요청 목록 조회
  @Transactional(readOnly = true)
  public List<CancelRequestDto> getMyCancelRequests(Users student) {
    return enrollmentRepository.findUserPendingCancelRequestsOrderByCancelledAtDesc(student, EnrollmentStatus.ENROLLED)
        .stream()
        .map(this::toCancelRequestDto)
        .collect(Collectors.toList());
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
            e.getStatus()))
        .collect(Collectors.toList());
  }

  // === 관리자용 메소드 ===

  // 관리자 - 전체 수강 내역 조회
  @Transactional(readOnly = true)
  // Enrollment + User + Course를 한 번에 조회하고 진도율 계산 (취소된 수강 제외)
  public List<AdminEnrollmentDto> getAllEnrollments() {
    List<Enrollment> enrollments = enrollmentRepository.findAllWithUserAndCourse();
    // Enrollment 리스트 → AdminEnrollmentDto 리스트로 변환 (CANCELLED 제외, 진도율 계산 포함)
    return enrollments.stream()
        .filter(e -> e.getStatus() != EnrollmentStatus.CANCELLED) // 취소된 수강 제외
        .map(e -> {
          // 진도율 계산
          int completedLectures = 0;
          int totalLectures = 0;
          double progressRate = 0.0;

          try {
            completedLectures = lectureProgressRepository
                .findByEnrollmentAndCompletedYnTrue(e)
                .size();
            totalLectures = lectureService.getLecturesForStudent(e.getCourse()).size();
            progressRate = totalLectures > 0
                ? Math.round((double) completedLectures * 100.0 / totalLectures)
                : 0.0;
          } catch (Exception ex) {
            // 진도율 계산 실패 시 기본값 사용
            System.err.println("진도율 계산 실패 (enrollmentId: " + e.getEnrollmentId() + "): " + ex.getMessage());
          }

          return new AdminEnrollmentDto(
              e.getEnrollmentId(),
              e.getUser().getUserId(),
              e.getUser().getName(),
              e.getCourse().getCourseId(),
              e.getCourse().getTitle(),
              e.getEnrolledAt(),
              e.getStatus(),
              e.getCancelledBy() != null ? e.getCancelledBy().getUserId() : null,
              completedLectures,
              totalLectures,
              progressRate);
        })
        .collect(Collectors.toList());
  }

  // 관리자 - 수강 취소 (관리자 권한)
  @Transactional
  public void adminCancelEnrollment(Users admin, Long enrollmentId) {
    Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수강 정보입니다."));

    if (enrollment.getStatus() != EnrollmentStatus.ENROLLED
        || !enrollment.isCancelRequested()) {
      throw new IllegalStateException("수강 중이며 취소 요청 상태가 아닙니다.");
    }

    enrollment.cancel(admin);

    Integer coursePrice = enrollment.getCourse().getPrice();
    if (coursePrice != null && coursePrice > 0) {
      paymentService.processCourseCancelRefund(
          enrollment.getUser().getUserId(),
          coursePrice,
          enrollment.getCourse().getCourseId(),
          enrollment.getCourse().getTitle());
    }
  }

  // 관리자 - 취소 요청 승인
  @Transactional
  public void approveCancelRequest(Users admin, Long enrollmentId) {
    Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수강 정보입니다."));

    if (!enrollment.isCancelRequested()) {
      throw new IllegalStateException("처리 대기중인 요청이 아닙니다.");
    }

    adminCancelEnrollment(admin, enrollmentId);
  }

  // 관리자 - 취소 요청 반려
  @Transactional
  public void rejectCancelRequest(Users admin, Long enrollmentId, String reason) {
    Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수강 정보입니다."));

    if (!enrollment.isCancelRequested()) {
      throw new IllegalStateException("처리 대기중인 요청이 아닙니다.");
    }

    // 거절 전 상태 로깅
    System.out.println("=== 취소 요청 거절 전 상태 ===");
    System.out.println("Enrollment ID: " + enrollment.getEnrollmentId());
    System.out.println("Before reject - cancelledAt: " + enrollment.getCancelledAt());
    System.out.println("Before reject - isCancelRequested: " + enrollment.isCancelRequested());

    enrollment.rejectCancelRequest();

    // 거절 후 상태 로깅
    System.out.println("After reject - cancelledAt: " + enrollment.getCancelledAt());
    System.out.println("After reject - isCancelRequested: " + enrollment.isCancelRequested());

    enrollmentRepository.save(enrollment);

    // 저장 후 상태 재확인
    Enrollment savedEnrollment = enrollmentRepository.findById(enrollmentId).orElse(null);
    if (savedEnrollment != null) {
      System.out.println("After save - cancelledAt: " + savedEnrollment.getCancelledAt());
      System.out.println("After save - isCancelRequested: " + savedEnrollment.isCancelRequested());
    }

    // 학생에게 반려 알림 전송
    String notificationTitle = "수강 취소 요청이 반려되었습니다";
    if (reason != null && !reason.trim().isEmpty()) {
      notificationTitle += " - " + reason.trim();
    }

    notificationService.createNotification(
        enrollment.getUser(),
        "CANCEL_REJECT",
        notificationTitle,
        "/student/mypage" // 반려 시 마이페이지로 이동하도록 수정
    );

    System.out.println("=== 수강취소 요청 반려 완료 ===");
  }

  // 관리자 - 취소 요청 목록 조회
  @Transactional(readOnly = true)
  public List<CancelRequestDto> getCancelRequestsForAdmin(Users student) {
    List<Enrollment> enrollments;
    if (student == null) {
      enrollments = enrollmentRepository.findPendingCancelRequestsOrderByCancelledAtDesc(EnrollmentStatus.ENROLLED);
    } else {
      enrollments = enrollmentRepository.findUserPendingCancelRequestsOrderByCancelledAtDesc(student,
          EnrollmentStatus.ENROLLED);
    }

    return enrollments.stream()
        .map(this::toCancelRequestDto)
        .collect(Collectors.toList());
  }

  private CancelRequestDto toCancelRequestDto(Enrollment enrollment) {
    int completedLectures = lectureProgressRepository
        .findByEnrollmentAndCompletedYnTrue(enrollment)
        .size();
    int totalLectures = lectureService.getLecturesForStudent(enrollment.getCourse()).size();
    double progressPercent = totalLectures > 0
        ? Math.round((double) completedLectures * 100.0 / totalLectures)
        : 0.0;

    CancelRequestDto dto = new CancelRequestDto();
    dto.setEnrollmentId(enrollment.getEnrollmentId());
    dto.setRequestId(enrollment.getEnrollmentId()); // 프론트엔드 호환
    dto.setId(enrollment.getEnrollmentId()); // 프론트엔드 호환
    dto.setCourseId(enrollment.getCourse().getCourseId());
    dto.setCourseTitle(enrollment.getCourse().getTitle());
    dto.setStudentName(enrollment.getUser().getName());
    dto.setStudentEmail(enrollment.getUser().getEmail());
    dto.setEnrollmentDate(enrollment.getEnrolledAt());
    dto.setCancelRequestDate(enrollment.getCancelledAt());
    dto.setRequestedAt(enrollment.getCancelledAt()); // 프론트엔드 호환
    dto.setCreatedAt(enrollment.getCancelledAt()); // 프론트엔드 호환
    dto.setProgress(progressPercent);
    dto.setCurrentProgress(progressPercent); // 프론트엔드 호환
    dto.setProgressRate(progressPercent); // 프론트엔드 호환
    dto.setCompletedLectures(completedLectures);
    dto.setTotalLectures(totalLectures);
    dto.setStatus(enrollment.getStatus());

    return dto;
  }

  // 관리자 - 특정 강좌의 수강생 조회
  @Transactional(readOnly = true)
  public List<AdminEnrollmentDto> getAdminCourseStudents(Course course) {
    List<Enrollment> enrollments = enrollmentRepository.findAdminByCourse(course);
    return enrollments.stream()
        .filter(e -> e.getStatus() != EnrollmentStatus.CANCELLED) // 취소된 수강 제외
        .map(e -> {
          // 진도율 계산
          int completedLectures = 0;
          int totalLectures = 0;
          double progressRate = 0.0;

          try {
            completedLectures = lectureProgressRepository
                .findByEnrollmentAndCompletedYnTrue(e)
                .size();
            totalLectures = lectureService.getLecturesForStudent(e.getCourse()).size();
            progressRate = totalLectures > 0
                ? Math.round((double) completedLectures * 100.0 / totalLectures)
                : 0.0;
          } catch (Exception ex) {
            // 진도율 계산 실패 시 기본값 사용
            System.err.println("진도율 계산 실패 (enrollmentId: " + e.getEnrollmentId() + "): " + ex.getMessage());
          }

          return new AdminEnrollmentDto(
              e.getEnrollmentId(),
              e.getUser().getUserId(),
              e.getUser().getName(),
              e.getCourse().getCourseId(),
              e.getCourse().getTitle(),
              e.getEnrolledAt(),
              e.getStatus(),
              e.getCancelledBy() != null ? e.getCancelledBy().getUserId() : null,
              completedLectures,
              totalLectures,
              progressRate);
        })
        .collect(Collectors.toList());
  }
}
