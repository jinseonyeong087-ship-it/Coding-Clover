package com.mysite.clover.Course;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
public class CourseController {

    private final CourseService cs;
    private final UsersRepository ur;

    // ==========================================
    // 🟦 공통 영역 (비로그인 / 로그인 공통)
    // ==========================================

    // 전체 강좌 목록
    @GetMapping("/course")
    public ResponseEntity<List<Course>> list() {
        return ResponseEntity.ok(cs.getPublicList());
    }

    // 레벨별 강좌 목록
    @GetMapping("/course/level/{level}")
    public ResponseEntity<List<Course>> listByLevel(@PathVariable int level) {
        return ResponseEntity.ok(cs.getPublicListByLevel(level));
    }

    // ==========================================
    // 🟩 수강생 영역
    // ==========================================

    // 내 강좌 목록
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/course")
    public ResponseEntity<List<Course>> studentList(Principal principal) {
        Users user = ur.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 없음"));
        return ResponseEntity.ok(cs.getStudentList(user));
    }

    // 수강 중 강좌
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/course/active")
    public ResponseEntity<List<Course>> studentActiveList(Principal principal) {
        Users user = ur.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 없음"));
        return ResponseEntity.ok(cs.getStudentActiveList(user));
    }

    // 수강 완료 강좌
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/course/completed")
    public ResponseEntity<List<Course>> studentCompletedList(Principal principal) {
        Users user = ur.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 없음"));
        return ResponseEntity.ok(cs.getStudentCompletedList(user));
    }

    // 강좌 상세 (수강생용)
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/course/{courseId}")
    public ResponseEntity<Course> studentCourseDetail(@PathVariable Long courseId) {
        return ResponseEntity.ok(cs.getCourse(courseId));
    }

    // 수강 신청/취소는 EnrollmentController에서 처리 (/student/course/{courseId}/enroll 등)
    // 만약 여기서 처리해야 한다면 EnrollmentService를 주입받아 호출해야 함.
    // 현재는 url.md 경로가 EnrollmentController 경로와 유사하므로 생략하거나,
    // EnrollmentController 경로를 수정하지 못하는 상황이면 여기서 포워딩 해야 함.
    // 일단 EnrollmentController가 존재하므로 생략.

    // ==========================================
    // 🟨 강사 영역
    // ==========================================

    // 강좌 관리 (내 강좌 목록)
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course")
    public ResponseEntity<List<Course>> instructorList(Principal principal) {
        Users user = ur.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 없음"));
        return ResponseEntity.ok(cs.getInstructorList(user));
    }

    // 강좌 개설 요청
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/instructor/course/new")
    public ResponseEntity<String> create(
            @RequestBody @Valid CourseForm courseForm,
            Principal principal) {

        Users user = ur.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        cs.create(
                courseForm.getTitle(),
                courseForm.getDescription(),
                courseForm.getLevel(),
                courseForm.getPrice(),
                user, // created_by
                CourseProposalStatus.PENDING);
        return ResponseEntity.ok("강좌 개설 요청 성공");
    }

    // 강좌 상세 (강사용)
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course/{id}")
    public ResponseEntity<Course> instructorCourseDetail(@PathVariable Long id) {
        return ResponseEntity.ok(cs.getCourse(id));
    }

    // ==========================================
    // 🟥 관리자 영역
    // ==========================================

    // 강좌 관리 (전체 목록)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/course")
    public ResponseEntity<List<Course>> adminList() {
        return ResponseEntity.ok(cs.getList());
    }

    // 승인 대기 강좌
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/course/pending")
    public ResponseEntity<List<Course>> adminPendingList() {
        return ResponseEntity.ok(cs.getPendingList());
    }

    // 강좌 승인
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/course/{id}/approve")
    public ResponseEntity<String> approve(@PathVariable Long id, Principal principal) {
        Users admin = ur.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("관리자 없음"));
        Course course = cs.getCourse(id);
        cs.approve(course, admin);
        return ResponseEntity.ok("승인 완료");
    }

    // 강좌 반려
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/course/{id}/reject")
    public ResponseEntity<String> reject(@PathVariable Long id, @RequestBody RejectRequest req) {
        Course course = cs.getCourse(id);
        cs.reject(course, req.getReason());
        return ResponseEntity.ok("반려 완료");
    }

    // 강좌 모집 종료
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/course/{id}/close")
    public ResponseEntity<String> close(@PathVariable Long id) {
        Course course = cs.getCourse(id);
        cs.close(course);
        return ResponseEntity.ok("강좌 모집 종료 완료");
    }
}
