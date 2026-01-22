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

    // 강좌 상세 (맛보기/공통)
    @GetMapping("/course/{id}")
    public ResponseEntity<Course> detail(@PathVariable Long id) {
        return ResponseEntity.ok(cs.getCourse(id));
    }

    // ==========================================
    // 🟩 수강생 영역
    // ==========================================

    // 강좌 상세 (수강생용 - 수강 중인 강좌의 상세 정보, 커리큘럼 등 포함 가능)
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/course/{courseId}")
    public ResponseEntity<Course> studentCourseDetail(@PathVariable Long courseId) {
        return ResponseEntity.ok(cs.getCourse(courseId));
    }

    // 수강 내역(active/completed) 조회는 EnrollmentController (/student/enrollment/...) 에서
    // 담당

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

    // 강좌 삭제
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @DeleteMapping("/instructor/course/{id}/delete")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        Course course = cs.getCourse(id);
        // 작성자 본인 확인 로직 필요 (생략 가능하나 추가 추천)
        cs.delete(course);
        return ResponseEntity.ok("강좌 삭제 성공");
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
