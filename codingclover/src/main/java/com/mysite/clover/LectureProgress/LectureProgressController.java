package com.mysite.clover.LectureProgress;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseRepository;
import com.mysite.clover.Enrollment.Enrollment;
import com.mysite.clover.Enrollment.EnrollmentRepository;
import com.mysite.clover.Enrollment.EnrollmentStatus;
import com.mysite.clover.Lecture.Lecture;
import com.mysite.clover.Lecture.LectureService;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import lombok.RequiredArgsConstructor;

public class LectureProgressController {

    // ================= 학생 =================
    @RestController
    @RequestMapping("/api/student")
    @RequiredArgsConstructor
    static class StudentLectureProgressController {

        private final LectureProgressService lectureProgressService;
        private final LectureService lectureService;
        private final EnrollmentRepository enrollmentRepository;
        private final CourseRepository courseRepository;
        private final UsersRepository usersRepository;

        // 강좌 내 강의 진도 목록
        // ENROLLED(수강중) + COMPLETED(수강완료) 모두 진도 조회 가능
        // → 수강 완료 후에도 마이페이지에서 진도율이 정상 반영됨
        @GetMapping("/course/{courseId}/progress")
        @PreAuthorize("hasRole('STUDENT')")
        public ResponseEntity<List<StudentLectureProgressDto>> getCourseProgress(
                @PathVariable Long courseId,
                Principal principal) {

            Users user = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("강좌 없음"));

            Enrollment enrollment = enrollmentRepository
                .findByUserAndCourseAndStatusIn(user, course,
                    List.of(EnrollmentStatus.ENROLLED, EnrollmentStatus.COMPLETED))
                .orElseThrow(() -> new IllegalStateException("수강 아님"));

            List<StudentLectureProgressDto> result =
                lectureProgressService.getAllProgressByEnrollment(enrollment)
                    .stream()
                    .map(p -> new StudentLectureProgressDto(
                        p.getProgressId(),
                        p.getLecture().getLectureId(),
                        p.getLecture().getTitle(),
                        p.getLecture().getOrderNo(),
                        p.getCompletedYn(),
                        p.getLastWatchedAt()
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(result);
        }

        // 강의 완료
        @PostMapping("/lecture/{lectureId}/complete")
        @PreAuthorize("hasRole('STUDENT')")
        public ResponseEntity<Void> completeLecture(
                @PathVariable Long lectureId,
                Principal principal) {

            Users user = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            Lecture lecture = lectureService.findById(lectureId);

            Enrollment enrollment = enrollmentRepository
                .findByUserAndCourseAndStatusIn(user, lecture.getCourse(), List.of(EnrollmentStatus.ENROLLED, EnrollmentStatus.COMPLETED))
                .orElseThrow(() -> new IllegalStateException("수강 아님"));

            lectureProgressService.completeLecture(enrollment, lecture);
            return ResponseEntity.ok().build();
        }

        // 시청 기록
        @PostMapping("/lecture/{lectureId}/watch")
        @PreAuthorize("hasRole('STUDENT')")
        public ResponseEntity<Void> watchLecture(
                @PathVariable Long lectureId,
                Principal principal) {

            Users user = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            Lecture lecture = lectureService.findById(lectureId);

            Enrollment enrollment = enrollmentRepository
                .findByUserAndCourseAndStatusIn(user, lecture.getCourse(), List.of(EnrollmentStatus.ENROLLED, EnrollmentStatus.COMPLETED))
                .orElseThrow(() -> new IllegalStateException("수강 아님"));

            lectureProgressService.updateLastWatched(enrollment, lecture);
            return ResponseEntity.ok().build();
        }
    }

    // ================= 강사 =================
    @RestController
    @RequestMapping("/api/instructor")
    @RequiredArgsConstructor
    static class InstructorLectureProgressController {

        private final LectureProgressService lectureProgressService;
        private final LectureService lectureService;
        private final UsersRepository usersRepository;

        // 특정 강의의 학생별 진도 조회
        @GetMapping("/lecture/{lectureId}/progress")
        @PreAuthorize("hasRole('INSTRUCTOR')")
        public ResponseEntity<Page<LectureProgress>> getLectureProgress(
                @PathVariable Long lectureId,
                Pageable pageable,
                Principal principal) {

            Users user = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            Lecture lecture = lectureService.findById(lectureId);

            if (!lecture.getCreatedBy().equals(user)) {
                throw new SecurityException("권한 없음");
            }

            return ResponseEntity.ok(
                lectureProgressService.getProgressByLecture(lecture, pageable)
            );
        }
    }

    // ================= 관리자 =================
    @RestController
    @RequestMapping("/api/admin")
    @RequiredArgsConstructor
    static class AdminLectureProgressController {

        private final LectureProgressRepository lectureProgressRepository;
        private final EnrollmentRepository enrollmentRepository;
        private final UsersRepository usersRepository;

        // 전체 진도 현황 (시스템 관리용)
        @GetMapping("/progress")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Page<AdminLectureProgressDto>> getAllProgress(Pageable pageable) {
            
            Page<LectureProgress> progressPage = lectureProgressRepository.findAll(pageable);
            
            Page<AdminLectureProgressDto> adminDtoPage = progressPage.map(progress -> {
                Enrollment enrollment = progress.getEnrollment();
                Lecture lecture = progress.getLecture();
                Course course = lecture.getCourse();
                Users student = enrollment.getUser();
                
                return new AdminLectureProgressDto(
                    progress.getProgressId(),
                    course.getCourseId(),
                    course.getTitle(),
                    lecture.getLectureId(),
                    lecture.getTitle(),
                    student.getUserId(),
                    student.getName(),
                    progress.getCompletedYn(),
                    progress.getLastWatchedAt(),
                    enrollment.getStatus()
                );
            });
            
            return ResponseEntity.ok(adminDtoPage);
        }
        
        // 문제되는 수강 상태 조회 (시스템 문제 파악)
        @GetMapping("/progress/issues")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<AdminLectureProgressDto>> getIssueProgress() {
            
            // 오래 시청하지 않은 진도 조회 (30일 이상)
            List<LectureProgress> issueProgressList = lectureProgressRepository.findAll()
                .stream()
                .filter(p -> p.getLastWatchedAt() != null && 
                           p.getLastWatchedAt().isBefore(java.time.LocalDateTime.now().minusDays(30)))
                .collect(Collectors.toList());
            
            List<AdminLectureProgressDto> issueDtoList = issueProgressList.stream()
                .map(progress -> {
                    Enrollment enrollment = progress.getEnrollment();
                    Lecture lecture = progress.getLecture();
                    Course course = lecture.getCourse();
                    Users student = enrollment.getUser();
                    
                    return new AdminLectureProgressDto(
                        progress.getProgressId(),
                        course.getCourseId(),
                        course.getTitle(),
                        lecture.getLectureId(),
                        lecture.getTitle(),
                        student.getUserId(),
                        student.getName(),
                        progress.getCompletedYn(),
                        progress.getLastWatchedAt(),
                        enrollment.getStatus()
                    );
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(issueDtoList);
        }
        
        // 특정 학생의 강의 진도 조회 (관리자용)
        @GetMapping("/progress/student/{studentId}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<AdminLectureProgressDto>> getStudentProgress(
                @PathVariable Long studentId) {
            
            Users student = usersRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("학생을 찾을 수 없습니다."));
                
            // 해당 학생의 모든 수강 정보 조회
            List<Enrollment> enrollments = enrollmentRepository.findByUser(student);
            
            List<AdminLectureProgressDto> progressDtoList = enrollments.stream()
                .flatMap(enrollment -> {
                    List<LectureProgress> progressList = lectureProgressRepository.findByEnrollment(enrollment);
                    return progressList.stream().map(progress -> {
                        Lecture lecture = progress.getLecture();
                        Course course = lecture.getCourse();
                        
                        return new AdminLectureProgressDto(
                            progress.getProgressId(),
                            course.getCourseId(),
                            course.getTitle(),
                            lecture.getLectureId(),
                            lecture.getTitle(),
                            student.getUserId(),
                            student.getName(),
                            progress.getCompletedYn(),
                            progress.getLastWatchedAt(),
                            enrollment.getStatus()
                        );
                    });
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(progressDtoList);
        }
    }
}
