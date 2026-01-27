package com.mysite.clover.Enrollment;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseRepository;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final CourseRepository courseRepository;
    private final UsersRepository usersRepository;

    // ==========================================
    // 수강생 영역
    // ==========================================

    // 학생 - 내 수강(enrollment) 목록 조회
    @GetMapping("/student/enrollment")
    // 로그인한 학생의 수강 목록을 조회
    public ResponseEntity<List<StudentEnrollmentDto>> getMyEnrollments(Principal principal) {

        try {
            //로그인(인증) 여부 확인
            if (principal == null) {
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }

            //로그인 ID로 사용자 조회
            Users student = usersRepository.findByLoginId(principal.getName())
                    .orElse(null);

            //DB에 사용자 정보가 없는 경우(성공 응답(200)을 주되, 데이터는 비어 있다고 처리)
            if (student == null) {
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }

            //학생의 수강 목록 조회
            List<StudentEnrollmentDto> enrollments = enrollmentService.getMyEnrollmentsForStudent(student);

            return ResponseEntity.ok(enrollments);

        } catch (Exception e) {
            // 조회 중 예외 발생 시에도 빈 리스트 반환
            e.printStackTrace();
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }

    // 수강 신청
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/student/enrollment/{courseId}/enroll")
    public ResponseEntity<String> enrollCourse(
            @PathVariable("courseId") Long courseId,
            Principal principal) {
        try {
            // 로그인한 사용자 정보 조회
            Users student = usersRepository.findByLoginId(principal.getName())
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강좌입니다."));
            enrollmentService.enroll(student, course);
            return ResponseEntity.ok("수강 신청이 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 수강 취소(학생 취소는 이력 보존을 위한 상태 변경이므로 POST로 처리)
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/student/enrollment/{courseId}/cancel")
    public ResponseEntity<String> cancelMyEnrollment(
            @PathVariable("courseId") Long courseId,
            Principal principal) {
        try {
            // 로그인한 사용자 정보 조회
            Users student = usersRepository.findByLoginId(principal.getName())
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강좌입니다."));
            enrollmentService.cancelMyEnrollment(student, course);
            return ResponseEntity.ok("수강이 취소되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==========================================
    // 강사 영역
    // ==========================================

    // 내 모든 강좌의 수강생 현황
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/enrollment")
    public ResponseEntity<List<InstructorEnrollmentDto>> getMyAllCourseStudents(
            Principal principal) {
        Users instructor = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        List<InstructorEnrollmentDto> students = enrollmentService.getMyAllCourseStudents(instructor);
        return ResponseEntity.ok(students);
    }

    // 특정 강좌의 수강생 목록
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course/{courseId}/enrollment")
    public ResponseEntity<List<InstructorEnrollmentDto>> getCourseStudents(
            @PathVariable("courseId") Long courseId,
            Principal principal) {
        Users instructor = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강좌입니다."));
        List<InstructorEnrollmentDto> students = enrollmentService.getCourseStudents(instructor, course);
        return ResponseEntity.ok(students);
    }

    // ==========================================
    // 관리자 영역
    // ==========================================

    // 전체 수강 내역 관리
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/enrollment")
    public ResponseEntity<List<AdminEnrollmentDto>> getAllEnrollments() {
        List<AdminEnrollmentDto> enrollments = enrollmentService.getAllEnrollments();
        return ResponseEntity.ok(enrollments);
    }

    // 특정 강좌의 수강생 조회 (관리자 권한)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/course/{courseId}/enrollment")
    public ResponseEntity<List<AdminEnrollmentDto>> getAdminCourseStudents(
            @PathVariable("courseId") Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강좌입니다."));
        List<AdminEnrollmentDto> students = enrollmentService.getAdminCourseStudents(course);
        return ResponseEntity.ok(students);
    }

    // 수강 강제 취소 (관리자의 강제 취소는 관리 행위이기 때문에 DELETE)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/enrollment/{enrollmentId}/cancel")
    public ResponseEntity<String> adminCancelEnrollment(
            @PathVariable("enrollmentId") Long enrollmentId,
            Principal principal) {
        try {
            Users admin = usersRepository.findByLoginId(principal.getName())
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
            enrollmentService.adminCancelEnrollment(admin, enrollmentId);
            return ResponseEntity.ok("수강이 취소되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
