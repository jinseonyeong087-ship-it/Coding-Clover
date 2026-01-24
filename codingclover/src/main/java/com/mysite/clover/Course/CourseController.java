package com.mysite.clover.Course;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.mysite.clover.Course.dto.AdminCourseDto;
import com.mysite.clover.Course.dto.CourseCreateRequest;
import com.mysite.clover.Course.dto.InstructorCourseDto;
import com.mysite.clover.Course.dto.StudentCourseDto;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
public class CourseController {

    private final CourseService courseService;
    private final UsersRepository usersRepository;

    // ==========================================
    // 🟦 공통 영역 (비로그인 / 로그인 공통)
    // ==========================================

    // 전체 : 강좌 목록 조회 (공통)======================
    @GetMapping("/course")
    public ResponseEntity<List<StudentCourseDto>> list() {
        return ResponseEntity.ok(courseService.getPublicList().stream()
                .map(StudentCourseDto::fromEntity)
                .toList());
    }

    // 전체 : 레벨별 강좌 목록 조회===================
    @GetMapping("/course/level/{level}")
    public ResponseEntity<List<StudentCourseDto>> listByLevel(@PathVariable int level) {
        return ResponseEntity.ok(courseService.getPublicListByLevel(level).stream()
                .map(StudentCourseDto::fromEntity)
                .toList());
    }

    // 전체 : 강좌 상세 조회 (비로그인/공통)==========================
    @GetMapping("/course/{id}")
    public ResponseEntity<StudentCourseDto> detail(@PathVariable Long id) {
        return ResponseEntity.ok(StudentCourseDto.fromEntity(courseService.getCourse(id)));
    }

    // ==========================================
    // 🟩 수강생 영역
    // ==========================================

    // 수강생 : 강좌 목록 조회==========================
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/course")
    public ResponseEntity<List<StudentCourseDto>> studentCourseList() {
        return ResponseEntity.ok(courseService.getPublicList().stream()
                .map(StudentCourseDto::fromEntity)
                .toList());
    }

    // 수강생 : 강좌 상세 조회==========================
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/course/{courseId}/lectures")
    public ResponseEntity<StudentCourseDto> studentCourseDetail(@PathVariable Long courseId) {
        return ResponseEntity.ok(StudentCourseDto.fromEntity(courseService.getCourse(courseId)));
    }

    // 수강 내역(active/completed) 조회는 EnrollmentController (/student/enrollment/...) 에서
    // 담당

    // ==========================================
    // 🟨 강사 영역
    // ==========================================

    // 강사 : 내 강좌 목록 조회==========================
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course")
    public ResponseEntity<List<InstructorCourseDto>> instructorList(Principal principal) {
        Users user = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 없음"));
        return ResponseEntity.ok(courseService.getInstructorList(user).stream()
                .map(InstructorCourseDto::fromEntity)
                .toList());
    }

    // 강사 : 신규 강좌 개설 요청===================
    @PostMapping("/instructor/course/new")
    public ResponseEntity<?> createCourse(
            @Valid @RequestBody CourseCreateRequest request,
            BindingResult bindingResult,
            Principal principal) {

        // 1. 유효성 검사
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest()
                    .body(bindingResult.getAllErrors().get(0).getDefaultMessage());
        }

        // 2. 실제 로그인한 유저(강사)를 찾음
        Users loginUser = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 정보가 없습니다."));

        // 3. 서비스 호출
        courseService.create(
                request.getTitle(),
                request.getDescription(),
                request.getLevel(),
                request.getPrice(),
                loginUser,
                CourseProposalStatus.PENDING);

        return ResponseEntity.ok("강좌 개설 신청이 완료되었습니다.");
    }

    // 강사 : 강좌 상세 조회============================
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course/{id}")
    public ResponseEntity<InstructorCourseDto> instructorCourseDetail(@PathVariable Long id) {
        return ResponseEntity.ok(InstructorCourseDto.fromEntity(courseService.getCourse(id)));
    }

    // 강사 : 강좌 수정 기능============================
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PutMapping("/instructor/course/{id}/edit")
    public ResponseEntity<String> updateCourse(@PathVariable Long id, @RequestBody CourseCreateRequest request,
            Principal principal) {
        Course course = courseService.getCourse(id);

        // 본인 확인 로직
        if (!course.getCreatedBy().getLoginId().equals(principal.getName())) {
    return ResponseEntity.status(403).body("본인의 강좌만 수정할 수 있습니다.");
}

        courseService.update(id, request.getTitle(), request.getDescription(), request.getLevel(), request.getPrice());
        return ResponseEntity.ok("강좌 수정 성공");
    }

    // 수강 신청 엔드포인트 확인
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/course/{id}/enroll")
    public ResponseEntity<String> enroll(@PathVariable Long id, Principal principal) {
        courseService.enroll(id, principal.getName());
        return ResponseEntity.ok("수강 신청이 완료되었습니다.");
    }

    // 강사 : 강좌 삭제==================
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @DeleteMapping("/instructor/course/{id}/delete")
    public ResponseEntity<String> delete(@PathVariable Long id, Principal principal) {
        Course course = courseService.getCourse(id);

        // 본인 확인 로직 반드시 추가
        if (!course.getCreatedBy().getLoginId().equals(principal.getName())) {
            return ResponseEntity.status(403).body("본인의 강좌만 삭제할 수 있습니다.");
        }

        courseService.delete(course);
        return ResponseEntity.ok("강좌 삭제 성공");
    }

    // ==========================================
    // 🟥 관리자 영역
    // ==========================================

    // 관리자 : 전체 강좌 목록 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/course")
    public ResponseEntity<List<AdminCourseDto>> adminList() {
        return ResponseEntity.ok(courseService.getList().stream()
                .map(AdminCourseDto::fromEntity)
                .toList());
    }

    // 관리자 : 승인 대기중인 강좌 목록 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/course/pending")
    public ResponseEntity<List<AdminCourseDto>> adminPendingList() {
        return ResponseEntity.ok(courseService.getPendingList().stream()
                .map(AdminCourseDto::fromEntity)
                .toList());
    }

    // 관리자 : 강좌 승인
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/course/{id}/approve")
    public ResponseEntity<String> approve(@PathVariable Long id, Principal principal) {
        Users admin = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("관리자 없음"));
        Course course = courseService.getCourse(id);
        courseService.approve(course, admin);
        return ResponseEntity.ok("승인 완료");
    }

    // 관리자 : 강좌 반려
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/course/{id}/reject")
    public ResponseEntity<String> reject(@PathVariable Long id, @RequestBody RejectRequest req) {
        Course course = courseService.getCourse(id);
        courseService.reject(course, req.getReason());
        return ResponseEntity.ok("반려 완료");
    }
}
