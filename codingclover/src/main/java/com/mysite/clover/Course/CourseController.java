package com.mysite.clover.Course;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

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

    // [공통]

    // 강좌 목록 조회 (승인됨)
    @GetMapping("/course")
    public ResponseEntity<List<StudentCourseDto>> list() {
        return ResponseEntity.ok(courseService.getPublicList().stream()
                .map(StudentCourseDto::fromEntity)
                .toList());
    }

    // 레벨별 강좌 목록 조회
    @GetMapping("/course/level/{level}")
    public ResponseEntity<List<StudentCourseDto>> listByLevel(@PathVariable("level") int level) {
        return ResponseEntity.ok(courseService.getPublicListByLevel(level).stream()
                .map(StudentCourseDto::fromEntity)
                .toList());
    }

    // 강좌 상세 조회
    @GetMapping("/course/{id}")
    public ResponseEntity<StudentCourseDto> detail(@PathVariable("id") Long id) {
        return ResponseEntity.ok(StudentCourseDto.fromEntity(courseService.getCourse(id)));
    }

    // [수강생]

    // 수강 신청
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/course/{id}/enroll")
    public ResponseEntity<String> enroll(@PathVariable("id") Long id, Principal principal) {
        courseService.enroll(id, principal.getName());
        return ResponseEntity.ok("수강 신청이 완료되었습니다.");
    }

    // [강사]

    // 본인 개설 강좌 목록
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course")
    public ResponseEntity<List<InstructorCourseDto>> instructorList(Principal principal) {
        Users user = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        return ResponseEntity.ok(courseService.getInstructorList(user).stream()
                .map(InstructorCourseDto::fromEntity)
                .toList());
    }

    // 강좌 개설 요청
    @PostMapping("/instructor/course/new")
    public ResponseEntity<?> createCourse(
            @Valid @RequestBody CourseCreateRequest request,
            BindingResult bindingResult,
            Principal principal) {

        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
            if (errors.isEmpty() && bindingResult.hasGlobalErrors()) {
                return ResponseEntity.badRequest().body(bindingResult.getGlobalError().getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }

        Users loginUser = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 정보가 없습니다."));

        courseService.create(
                request.getTitle(),
                request.getDescription(),
                request.getLevel(),
                request.getPrice(),
                request.getThumbnailUrl(),
                loginUser,
                CourseProposalStatus.PENDING);

        return ResponseEntity.ok("강좌 개설 신청이 완료되었습니다.");
    }

    // 강좌 임시 저장
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/instructor/course/draft")
    public ResponseEntity<String> saveCourseDraft(
            @RequestBody CourseCreateRequest request,
            Principal principal) {

        Users instructor = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 정보가 없습니다."));

        Long courseId = courseService.saveDraft(request, instructor);

        return ResponseEntity.ok("강좌가 임시 저장되었습니다. (ID: " + courseId + ")");
    }

    // 임시 저장 최종 제출
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PutMapping("/instructor/course/{id}/submit")
    public ResponseEntity<String> submitCourseDraft(
            @PathVariable("id") Long id,
            @RequestBody CourseCreateRequest request,
            Principal principal) {

        courseService.submitDraft(id, request, principal.getName());
        return ResponseEntity.ok("강좌 개설 신청(최종 제출)이 완료되었습니다.");
    }

    // 강사측 강좌 상세
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course/{id}")
    public ResponseEntity<InstructorCourseDto> instructorCourseDetail(@PathVariable("id") Long id) {
        return ResponseEntity.ok(InstructorCourseDto.fromEntity(courseService.getCourse(id)));
    }

    // 강좌 수정
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PutMapping("/instructor/course/{id}/edit")
    public ResponseEntity<?> updateCourse(@PathVariable("id") Long id, @Valid @RequestBody CourseCreateRequest request,
            BindingResult bindingResult,
            Principal principal) {

        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
            if (errors.isEmpty() && bindingResult.hasGlobalErrors()) {
                return ResponseEntity.badRequest().body(bindingResult.getGlobalError().getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }

        Course course = courseService.getCourse(id);
        if (!course.getCreatedBy().getLoginId().equals(principal.getName())) {
            return ResponseEntity.status(403).body("본인의 강좌만 수정할 수 있습니다.");
        }

        courseService.update(id, request.getTitle(), request.getDescription(), request.getLevel(), request.getPrice(),
                request.getThumbnailUrl());

        return ResponseEntity.ok("강좌 수정 성공");
    }

    // 강좌 삭제
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @DeleteMapping("/instructor/course/{id}/delete")
    public ResponseEntity<String> delete(@PathVariable("id") Long id, Principal principal) {
        Course course = courseService.getCourse(id);

        if (!course.getCreatedBy().getLoginId().equals(principal.getName())) {
            return ResponseEntity.status(403).body("본인의 강좌만 삭제할 수 있습니다.");
        }

        courseService.delete(course);
        return ResponseEntity.ok("강좌 삭제 성공");
    }

    // 강좌 재심사 요청
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/instructor/course/{id}/resubmit")
    public ResponseEntity<?> resubmitCourse(
            @PathVariable("id") Long id,
            @Valid @RequestBody CourseCreateRequest request,
            BindingResult bindingResult,
            Principal principal) {

        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
            if (errors.isEmpty() && bindingResult.hasGlobalErrors()) {
                return ResponseEntity.badRequest().body(bindingResult.getGlobalError().getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }

        courseService.resubmitCourse(id, request, principal.getName());
        return ResponseEntity.ok("재심사 요청이 완료되었습니다.");
    }

    // [관리자]

    // 전체 강좌 목록
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/course")
    public ResponseEntity<List<AdminCourseDto>> adminList() {
        return ResponseEntity.ok(courseService.getList().stream()
                .map(AdminCourseDto::fromEntity)
                .toList());
    }

    // 강좌 상세 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/course/{id}")
    public ResponseEntity<AdminCourseDto> getCourseDetail(@PathVariable("id") Long id) {
        Course course = courseService.getCourse(id);
        return ResponseEntity.ok(AdminCourseDto.fromEntity(course));
    }

    // 승인 대기 목록
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/course/{id}/pending")
    public ResponseEntity<List<AdminCourseDto>> adminPendingList() {
        return ResponseEntity.ok(courseService.getPendingList().stream()
                .map(AdminCourseDto::fromEntity)
                .toList());
    }

    // 강좌 승인
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/course/{id}/approve")
    public ResponseEntity<String> approve(@PathVariable("id") Long id, Principal principal) {
        Users admin = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("관리자 없음"));

        Course course = courseService.getCourse(id);
        courseService.approve(course, admin);

        return ResponseEntity.ok("승인 완료");
    }

    // 강좌 반려
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/course/{id}/reject")
    public ResponseEntity<String> reject(@PathVariable("id") Long id, @RequestBody RejectRequest req) {
        Course course = courseService.getCourse(id);
        courseService.reject(course, req.getReason());

        return ResponseEntity.ok("반려 완료");
    }

    // 특정 강사의 강좌 목록
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/course/instructor/{instructorId}")
    public ResponseEntity<List<AdminCourseDto>> getInstructorCourses(@PathVariable("instructorId") Long instructorId) {
        Users instructor = usersRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("강사를 찾을 수 없습니다."));

        return ResponseEntity.ok(courseService.getInstructorList(instructor).stream()
                .map(AdminCourseDto::fromEntity)
                .toList());
    }
}
