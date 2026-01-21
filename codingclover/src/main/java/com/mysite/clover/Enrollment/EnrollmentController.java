package com.mysite.clover.Enrollment;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mysite.clover.Users.Users;

import lombok.RequiredArgsConstructor;

/*REST API 엔드포인트 제공 */
@RestController
@RequiredArgsConstructor
public class EnrollmentController {
    
    private final EnrollmentService enrollmentService;

    // ===== 학생용 API =====
    @RequestMapping("/api/student")
    @RestController
    @RequiredArgsConstructor
    static class StudentEnrollmentController {
        
        private final EnrollmentService enrollmentService;
        
        // 내 수강 내역 조회
        @PreAuthorize("hasRole('STUDENT')")
        @GetMapping("/enrollment")
        public ResponseEntity<List<StudentEnrollmentDto>> getMyEnrollments(
                @AuthenticationPrincipal Users student) {
            List<StudentEnrollmentDto> enrollments = enrollmentService.getMyEnrollmentsForStudent(student);
            return ResponseEntity.ok(enrollments);
        }
        
        // 강좌 수강 신청
        @PreAuthorize("hasRole('STUDENT')")
        @PostMapping("/course/{courseId}/enroll")
        public ResponseEntity<String> enrollCourse(
                @PathVariable Long courseId,
                @AuthenticationPrincipal Users student) {
            try {
                enrollmentService.enrollCourse(student, courseId);
                return ResponseEntity.ok("수강 신청이 완료되었습니다.");
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }
        
        // 내 수강 취소
        @PreAuthorize("hasRole('STUDENT')")
        @DeleteMapping("/course/{courseId}/cancel")
        public ResponseEntity<String> cancelMyEnrollment(
                @PathVariable Long courseId,
                @AuthenticationPrincipal Users student) {
            try {
                enrollmentService.cancelMyEnrollment(student, courseId);
                return ResponseEntity.ok("수강이 취소되었습니다.");
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }
    }
    
    // ===== 강사용 API =====
    @RequestMapping("/api/instructor")
    @RestController
    @RequiredArgsConstructor
    static class InstructorEnrollmentController {
        
        private final EnrollmentService enrollmentService;
        
        // 내 모든 강좌의 수강생 현황
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/enrollment")
        public ResponseEntity<List<InstructorEnrollmentDto>> getMyAllCourseStudents(
                @AuthenticationPrincipal Users instructor) {
            List<InstructorEnrollmentDto> students = enrollmentService.getMyAllCourseStudents(instructor);
            return ResponseEntity.ok(students);
        }
        
        // 특정 강좌의 수강생 목록
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/course/{courseId}/enrollment")
        public ResponseEntity<List<InstructorEnrollmentDto>> getCourseStudents(
                @PathVariable Long courseId,
                @AuthenticationPrincipal Users instructor) {
            List<InstructorEnrollmentDto> students = enrollmentService.getCourseStudents(instructor, courseId);
            return ResponseEntity.ok(students);
        }
    }
    
    // ===== 관리자용 API =====
    @RequestMapping("/api/admin")
    @RestController
    @RequiredArgsConstructor
    static class AdminEnrollmentController {
        
        private final EnrollmentService enrollmentService;
        
        // 전체 수강 내역 관리
        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/enrollment")
        public ResponseEntity<List<AdminEnrollmentDto>> getAllEnrollments() {
            List<AdminEnrollmentDto> enrollments = enrollmentService.getAllEnrollments();
            return ResponseEntity.ok(enrollments);
        }
        
        // 특정 강좌의 수강생 조회 (관리자 권한)
        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/course/{courseId}/enrollment")
        public ResponseEntity<List<AdminEnrollmentDto>> getAdminCourseStudents(
                @PathVariable Long courseId) {
            List<AdminEnrollmentDto> students = enrollmentService.getAdminCourseStudents(courseId);
            return ResponseEntity.ok(students);
        }
        
        // 수강 강제 취소 (관리자 권한)
        @PreAuthorize("hasRole('ADMIN')")
        @DeleteMapping("/enrollment/{enrollmentId}/cancel")
        public ResponseEntity<String> adminCancelEnrollment(
                @PathVariable Long enrollmentId,
                @AuthenticationPrincipal Users admin) {
            try {
                enrollmentService.adminCancelEnrollment(admin, enrollmentId);
                return ResponseEntity.ok("수강이 취소되었습니다.");
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }
    }
}
