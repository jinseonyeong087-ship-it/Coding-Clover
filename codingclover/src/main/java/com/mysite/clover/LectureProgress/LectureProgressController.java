package com.mysite.clover.LectureProgress;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseRepository;
import com.mysite.clover.Enrollment.Enrollment;
import com.mysite.clover.Enrollment.EnrollmentRepository;
import com.mysite.clover.Enrollment.EnrollmentService;
import com.mysite.clover.Enrollment.EnrollmentStatus;
import com.mysite.clover.Lecture.Lecture;
import com.mysite.clover.Lecture.LectureService;
import com.mysite.clover.Users.Users;

import lombok.RequiredArgsConstructor;

/* 강의 진도 관리 REST API */
@RestController
@RequiredArgsConstructor
public class LectureProgressController {
    
    private final LectureProgressService lectureProgressService;
    private final EnrollmentService enrollmentService;
    private final LectureService lectureService;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    // ===== 학생용 API =====
    @RequestMapping("/api/student")
    @RestController
    @RequiredArgsConstructor
    static class StudentLectureProgressController {
        
        private final LectureProgressService lectureProgressService;
        private final EnrollmentService enrollmentService;
        private final LectureService lectureService;
        private final EnrollmentRepository enrollmentRepository;
        private final CourseRepository courseRepository;

        /**
         * 특정 강좌의 진도 현황 조회
         * GET /api/student/course/{courseId}/progress
         */
        @GetMapping("/course/{courseId}/progress")
        @PreAuthorize("hasRole('STUDENT')")
        public ResponseEntity<List<StudentLectureProgressDto>> getCourseProgress(
                @PathVariable Long courseId,
                @AuthenticationPrincipal Users user) {
            
            try {
                // 수강 정보 조회
                Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("강좌를 찾을 수 없습니다."));
                
                Enrollment enrollment = enrollmentRepository
                    .findByUserAndCourseAndStatus(user, course, EnrollmentStatus.ENROLLED)
                    .orElseThrow(() -> new IllegalStateException("수강 중인 강좌가 아닙니다."));
                
                // 해당 강좌의 모든 강의 진도 조회
                List<LectureProgress> progressList = lectureProgressService.getAllProgressByEnrollment(enrollment);
                
                // DTO 변환 (실제로는 별도 변환 메소드 필요)
                List<StudentLectureProgressDto> progressDtoList = progressList.stream()
                    .map(p -> new StudentLectureProgressDto(
                        p.getProgressId(),
                        p.getLecture().getLectureId(),
                        p.getLecture().getTitle(),
                        p.getLecture().getOrderNo(),
                        p.getCompletedYn(),
                        p.getLastWatchedAt()
                    ))
                    .collect(Collectors.toList());
                
                return ResponseEntity.ok(progressDtoList);
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
        }

        /**
         * 강의 완료 처리
         * POST /api/student/lecture/{lectureId}/complete
         */
        @PostMapping("/lecture/{lectureId}/complete")
        @PreAuthorize("hasRole('STUDENT')")
        public ResponseEntity<String> completeLecture(
                @PathVariable Long lectureId,
                @AuthenticationPrincipal Users user) {
            
            try {
                // 강의 조회
                Lecture lecture = lectureService.findById(lectureId);
                
                // 수강 정보 조회
                Enrollment enrollment = enrollmentRepository
                    .findByUserAndCourseAndStatus(user, lecture.getCourse(), EnrollmentStatus.ENROLLED)
                    .orElseThrow(() -> new IllegalStateException("수강 중인 강좌가 아닙니다."));
                
                // 강의 완료 처리
                lectureProgressService.completeLecture(enrollment, lecture);
                
                return ResponseEntity.ok("강의 완료 처리되었습니다.");
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("강의 완료 처리에 실패했습니다: " + e.getMessage());
            }
        }

        /**
         * 강의 시청 기록 업데이트
         * POST /api/student/lecture/{lectureId}/watch
         */
        @PostMapping("/lecture/{lectureId}/watch")
        @PreAuthorize("hasRole('STUDENT')")
        public ResponseEntity<String> updateWatchRecord(
                @PathVariable Long lectureId,
                @AuthenticationPrincipal Users user) {
            
            try {
                // 강의 조회
                Lecture lecture = lectureService.findById(lectureId);
                
                // 수강 정보 조회
                Enrollment enrollment = enrollmentRepository
                    .findByUserAndCourseAndStatus(user, lecture.getCourse(), EnrollmentStatus.ENROLLED)
                    .orElseThrow(() -> new IllegalStateException("수강 중인 강좌가 아닙니다."));
                
                // 시청 기록 업데이트
                lectureProgressService.updateLastWatched(enrollment, lecture);
                
                return ResponseEntity.ok("시청 기록이 업데이트되었습니다.");
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("시청 기록 업데이트에 실패했습니다: " + e.getMessage());
            }
        }

        /**
         * 최근 시청한 강의 목록 조회
         * GET /api/student/progress/recent
         */
        @GetMapping("/progress/recent")
        @PreAuthorize("hasRole('STUDENT')")
        public ResponseEntity<List<StudentLectureProgressDto>> getRecentWatchedLectures(
                @AuthenticationPrincipal Users user) {
            
            try {
                // 사용자의 모든 수강 정보에서 최근 시청 강의 조회
                List<Enrollment> enrollments = enrollmentRepository.findByUserAndStatus(user, EnrollmentStatus.ENROLLED);
                
                List<StudentLectureProgressDto> recentLectures = new ArrayList<>();
                for (Enrollment enrollment : enrollments) {
                    List<LectureProgress> recentProgress = lectureProgressService.getRecentWatchedLectures(enrollment);
                    recentProgress.stream()
                        .limit(5) // 각 강좌당 최대 5개
                        .forEach(p -> recentLectures.add(new StudentLectureProgressDto(
                            p.getProgressId(),
                            p.getLecture().getLectureId(),
                            p.getLecture().getTitle(),
                            p.getLecture().getOrderNo(),
                            p.getCompletedYn(),
                            p.getLastWatchedAt()
                        )));
                }
                
                // 최근 시청 시간 순으로 정렬
                recentLectures.sort((a, b) -> b.getLastWatchedAt().compareTo(a.getLastWatchedAt()));
                
                return ResponseEntity.ok(recentLectures.stream().limit(10).collect(Collectors.toList()));
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
        }

        /**
         * 완료한 강의 수 조회
         * GET /api/student/course/{courseId}/completed-count
         */
        @GetMapping("/course/{courseId}/completed-count")
        @PreAuthorize("hasRole('STUDENT')")
        public ResponseEntity<Integer> getCompletedLectureCount(
                @PathVariable Long courseId,
                @AuthenticationPrincipal Users user) {
            
            try {
                // 수강 정보 조회
                Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("강좌를 찾을 수 없습니다."));
                
                Enrollment enrollment = enrollmentRepository
                    .findByUserAndCourseAndStatus(user, course, EnrollmentStatus.ENROLLED)
                    .orElseThrow(() -> new IllegalStateException("수강 중인 강좌가 아닙니다."));
                
                // 완료한 강의 수 조회
                int count = lectureProgressService.getCompletedLectureCount(enrollment);
                
                return ResponseEntity.ok(count);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(0);
            }
        }
    }

    // ===== 강사용 API =====
    @RequestMapping("/api/instructor")
    @RestController
    @RequiredArgsConstructor
    static class InstructorLectureProgressController {
        
        private final LectureProgressService lectureProgressService;
        private final LectureService lectureService;

        /**
         * 특정 강의의 수강생 진도 현황 조회
         * GET /api/instructor/lecture/{lectureId}/progress
         */
        @GetMapping("/lecture/{lectureId}/progress")
        @PreAuthorize("hasRole('INSTRUCTOR')")
        public ResponseEntity<Page<InstructorLectureProgressDto>> getLectureProgress(
                @PathVariable Long lectureId,
                @PageableDefault(size = 20) Pageable pageable,
                @AuthenticationPrincipal Users user) {
            
            // TODO: Service에서 강사 권한 확인 및 InstructorLectureProgressDto 변환 로직 구현 필요
            // Lecture lecture = lectureService.findById(lectureId);
            // if (!lecture.getCreatedBy().equals(user)) throw new SecurityException("권한이 없습니다.");
            // Page<InstructorLectureProgressDto> progress = lectureProgressService.getInstructorProgress(lecture, pageable);
            
            return ResponseEntity.ok().build();
        }

        /**
         * 강좌별 전체 진도 현황 조회
         * GET /api/instructor/course/{courseId}/progress
         */
        @GetMapping("/course/{courseId}/progress")
        @PreAuthorize("hasRole('INSTRUCTOR')")
        public ResponseEntity<List<InstructorLectureProgressDto>> getCourseProgressByInstructor(
                @PathVariable Long courseId,
                @AuthenticationPrincipal Users user) {
            
            // TODO: Service에서 강사 권한 확인 및 강좌별 진도 현황 조회 로직 구현 필요
            // Course course = courseService.findById(courseId);
            // if (!course.getCreatedBy().equals(user)) throw new SecurityException("권한이 없습니다.");
            // List<InstructorLectureProgressDto> progress = lectureProgressService.getCourseProgressForInstructor(course);
            
            return ResponseEntity.ok().build();
        }
    }

    // ===== 관리자용 API =====
    @RequestMapping("/api/admin")
    @RestController
    @RequiredArgsConstructor
    static class AdminLectureProgressController {
        
        private final LectureProgressService lectureProgressService;

        /**
         * 전체 진도 현황 조회 (관리자용)
         * GET /api/admin/progress
         */
        @GetMapping("/progress")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Page<AdminLectureProgressDto>> getAllProgress(
                @PageableDefault(size = 50) Pageable pageable) {
            
            // TODO: Service에서 AdminLectureProgressDto 변환 로직 구현 필요
            // Page<AdminLectureProgressDto> allProgress = lectureProgressService.getAllProgressForAdmin(pageable);
            
            return ResponseEntity.ok().build();
        }

        /**
         * 특정 사용자의 진도 현황 조회 (관리자용)
         * GET /api/admin/user/{userId}/progress
         */
        @GetMapping("/user/{userId}/progress")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<AdminLectureProgressDto>> getUserProgress(
                @PathVariable Long userId) {
            
            // TODO: Service에서 특정 사용자 진도 조회 및 AdminLectureProgressDto 변환 로직 구현 필요
            // List<AdminLectureProgressDto> userProgress = lectureProgressService.getUserProgressForAdmin(userId);
            
            return ResponseEntity.ok().build();
        }

        /**
         * 특정 강좌의 진도 현황 조회 (관리자용)
         * GET /api/admin/course/{courseId}/progress
         */
        @GetMapping("/course/{courseId}/progress")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Page<AdminLectureProgressDto>> getCourseProgressByAdmin(
                @PathVariable Long courseId,
                @PageableDefault(size = 50) Pageable pageable) {
            
            // TODO: Service에서 특정 강좌 진도 조회 및 AdminLectureProgressDto 변환 로직 구현 필요
            // Page<AdminLectureProgressDto> courseProgress = lectureProgressService.getCourseProgressForAdmin(courseId, pageable);
            
            return ResponseEntity.ok().build();
        }
    }
}
