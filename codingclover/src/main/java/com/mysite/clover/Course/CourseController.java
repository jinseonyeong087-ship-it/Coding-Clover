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

    // ==========================================
    // 🟦 공통 영역 (비로그인 / 로그인 공통)
    // ==========================================

    // 전체 : 강좌 목록 조회 (공통, 승인된 강좌만)
    @GetMapping("/course")
    public ResponseEntity<List<StudentCourseDto>> list() {
        // 공개된 강좌(승인 완료된) 목록을 서비스에서 조회
        return ResponseEntity.ok(courseService.getPublicList().stream()
                // 조회된 Course 엔티티를 수강생용 DTO(StudentCourseDto)로 변환
                .map(StudentCourseDto::fromEntity)
                // 변환된 DTO들을 리스트 형태로 수집
                .toList());
    }

    // 전체 : 레벨별 강좌 목록 조회 (필터링)
    @GetMapping("/course/level/{level}")
    public ResponseEntity<List<StudentCourseDto>> listByLevel(@PathVariable("level") int level) {
        // 특정 레벨에 해당하고 공개된 강좌 목록을 서비스에서 조회
        return ResponseEntity.ok(courseService.getPublicListByLevel(level).stream()
                // 조회된 Course 엔티티를 수강생용 DTO로 변환
                .map(StudentCourseDto::fromEntity)
                // 리스트 형태로 수집하여 반환
                .toList());
    }

    // 전체 : 강좌 상세 조회 (비로그인/공통 접근 가능)
    @GetMapping("/course/{id}")
    public ResponseEntity<StudentCourseDto> detail(@PathVariable("id") Long id) {
        // ID에 해당하는 강좌 정보를 서비스에서 조회 (공개 여부 등은 서비스에서 처리하거나 이 메서드에서 확인 필요)
        return ResponseEntity.ok(StudentCourseDto.fromEntity(courseService.getCourse(id)));
    }

    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(@RequestParam("courseId") Long courseId,
            @SessionAttribute(name = "user", required = false) Users user) {

        // 1. 비로그인 체크 -> 401 에러와 메시지 반환
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        try {
            // 2. 로그인된 경우 서비스 호출 (강좌ID, 로그인ID 전달)
            courseService.enroll(courseId, user.getLoginId());
            return ResponseEntity.ok("수강신청 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==========================================
    // 🟩 수강생 영역
    // ==========================================

    // 수강생 : 수강생 전용 강좌 목록 조회 (필요 시 특정 로직 추가 가능)
    @PreAuthorize("hasRole('STUDENT')") // 수강생(STUDENT) 권한만 접근 가능
    @GetMapping("/student/course/{courseId}")
    public ResponseEntity<List<StudentCourseDto>> studentCourseList() {
        // 공개된 강좌 목록을 조회하여 반환 (위의 /course와 동일한 로직처럼 보임, 필요 시 로직 수정)
        return ResponseEntity.ok(courseService.getPublicList().stream()
                // 엔티티를 수강생용 DTO로 변환
                .map(StudentCourseDto::fromEntity)
                // 리스트화
                .toList());
    }

    // 수강생 : 강좌 상세 조회 (수강생 권한)
    @PreAuthorize("hasRole('STUDENT')") // 수강생 권한 체크
    @GetMapping("/student/course/{courseId}/lectures")
    public ResponseEntity<StudentCourseDto> studentCourseDetail(@PathVariable("courseId") Long courseId) {
        // 강좌 상세 내용을 조회하여 DTO로 변환 후 반환
        return ResponseEntity.ok(StudentCourseDto.fromEntity(courseService.getCourse(courseId)));
    }

    // 수강 내역(active/completed) 조회는 EnrollmentController (/student/enrollment/...) 에서
    // 담당

    // ==========================================
    // 🟨 강사 영역
    // ==========================================

    // 강사 : 본인이 개설한 강좌 목록 조회
    @PreAuthorize("hasRole('INSTRUCTOR')") // 강사(INSTRUCTOR) 권한만 접근 가능
    @GetMapping("/instructor/course")
    public ResponseEntity<List<InstructorCourseDto>> instructorList(Principal principal) {
        // 1. 현재 로그인한 사용자의 정보를 유저 리포지토리에서 조회 (Principal 객체에서 ID 추출)
        Users user = usersRepository.findByLoginId(principal.getName())
                // 사용자가 존재하지 않을 경우 예외 발생
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        // 2. 해당 강사가 개설한 강좌 목록을 서비스에서 조회
        return ResponseEntity.ok(courseService.getInstructorList(user).stream()
                // 3. 엔티티를 강사용 DTO(InstructorCourseDto)로 변환
                .map(InstructorCourseDto::fromEntity)
                // 4. 리스트 형태로 수집하여 반환
                .toList());
    }

    // 강사 : 신규 강좌 개설 요청
    @PostMapping("/instructor/course/new")
    public ResponseEntity<?> createCourse(
            // 요청 본문(body) 데이터를 DTO로 매핑하며 유효성 검사 수행
            @Valid @RequestBody CourseCreateRequest request,
            // 유효성 검사 결과를 담는 객체
            BindingResult bindingResult,
            // 현재 로그인한 사용자 정보
            Principal principal) {

        // 1. 입력값 유효성 검사 결과 확인
        // 1. 입력값 유효성 검사 결과 확인
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
            // If no field errors but global errors exist, return the first global error
            // message
            if (errors.isEmpty() && bindingResult.hasGlobalErrors()) {
                return ResponseEntity.badRequest().body(bindingResult.getGlobalError().getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }

        // 2. 실제 로그인한 유저(강사) 정보를 DB에서 조회
        Users loginUser = usersRepository.findByLoginId(principal.getName())
                // 사용자 정보가 없으면 예외 발생
                .orElseThrow(() -> new RuntimeException("유저 정보가 없습니다."));

        // 3. 강좌 생성 서비스 호출 (초기 상태는 승인 대기)
        courseService.create(
                request.getTitle(), // 강좌 제목
                request.getDescription(), // 강좌 설명
                request.getLevel(), // 난이도
                request.getPrice(), // 수강료
                request.getThumbnailUrl(), // 썸네일 이미지 URL
                loginUser, // 강좌 개설자(강사)
                CourseProposalStatus.PENDING); // 초기 상태는 승인 대기(PENDING)로 설정

        // 4. 성공 메시지 반환
        return ResponseEntity.ok("강좌 개설 신청이 완료되었습니다.");
    }

    // [New] 강좌 임시 저장 API
    // URL: /instructor/course/draft
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/instructor/course/draft")
    public ResponseEntity<String> saveCourseDraft(
            @RequestBody CourseCreateRequest request,
            Principal principal) {

        Users instructor = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 정보가 없습니다."));

        // DRAFT 상태로 저장 (필수값 검증 Skip)
        Long courseId = courseService.saveDraft(request, instructor);

        return ResponseEntity.ok("강좌가 임시 저장되었습니다. (ID: " + courseId + ")");
    }

    // [New] 임시 저장된 강좌 최종 제출 (승인 요청)
    // URL: /instructor/course/{id}/submit
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PutMapping("/instructor/course/{id}/submit")
    public ResponseEntity<String> submitCourseDraft(
            @PathVariable("id") Long id,
            @RequestBody CourseCreateRequest request,
            Principal principal) {

        // 서비스에서 검증 후 상태 변경 (DRAFT -> PENDING)
        courseService.submitDraft(id, request, principal.getName());

        return ResponseEntity.ok("강좌 개설 신청(최종 제출)이 완료되었습니다.");
    }

    // 강사 : 개별 강좌 상세 조회
    @PreAuthorize("hasRole('INSTRUCTOR')") // 강사 권한 체크
    @GetMapping("/instructor/course/{id}")
    public ResponseEntity<InstructorCourseDto> instructorCourseDetail(@PathVariable("id") Long id) {
        // 강좌 ID로 상세 정보를 조회하여 강사용 DTO로 변환 후 반환
        return ResponseEntity.ok(InstructorCourseDto.fromEntity(courseService.getCourse(id)));
    }

    // 강사 : 강좌 정보 수정 기능
    @PreAuthorize("hasRole('INSTRUCTOR')") // 강사 권한 체크
    @PutMapping("/instructor/course/{id}/edit")
    // @Valid : 요청 본문(body) 데이터를 DTO로 매핑하며 유효성 검사 수행
    public ResponseEntity<?> updateCourse(@PathVariable("id") Long id, @Valid @RequestBody
    // 요청 본문(body) 데이터를 DTO로 매핑하며 유효성 검사 수행
    CourseCreateRequest request,
            // 유효성 검사 결과를 담는 객체
            BindingResult bindingResult,
            // 현재 로그인한 사용자 정보
            Principal principal) {

        // 입력값 유효성 검사
        // 입력값 유효성 검사
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
            // If no field errors but global errors exist, return the first global error
            // message
            if (errors.isEmpty() && bindingResult.hasGlobalErrors()) {
                return ResponseEntity.badRequest().body(bindingResult.getGlobalError().getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }

        // 1. 수정하려는 강좌 엔티티 조회
        Course course = courseService.getCourse(id);

        // 2. 본인 확인 (강좌 개설자와 현재 로그인한 사용자가 일치하는지 검사)
        if (!course.getCreatedBy().getLoginId().equals(principal.getName())) {
            // 본인이 아니라면 403 Forbidden 상태와 에러 메시지 반환
            return ResponseEntity.status(403).body("본인의 강좌만 수정할 수 있습니다.");
        }

        // 3. 강좌 수정 서비스 호출 (제목, 설명, 레벨 등 업데이트)
        courseService.update(id, request.getTitle(), request.getDescription(), request.getLevel(), request.getPrice(),
                request.getThumbnailUrl());

        // 4. 성공 메시지 반환
        return ResponseEntity.ok("강좌 수정 성공");
    }

    // 학생 : 수강 신청 엔드포인트
    @PreAuthorize("hasRole('STUDENT')") // 수강생 권한 체크
    @PostMapping("/course/{id}/enroll")
    public ResponseEntity<String> enroll(@PathVariable("id") Long id, Principal principal) {
        // 1. 수강 신청 서비스 호출 (강좌 ID와 로그인한 사용자 ID 전달)
        courseService.enroll(id, principal.getName());
        // 2. 성공 메시지 반환
        return ResponseEntity.ok("수강 신청이 완료되었습니다.");
    }

    // 강사 : 강좌 삭제 기능
    @PreAuthorize("hasRole('INSTRUCTOR')") // 강사 권한 체크
    @DeleteMapping("/instructor/course/{id}/delete")
    public ResponseEntity<String> delete(@PathVariable("id") Long id, Principal principal) {
        // 1. 삭제 대상 강좌 조회
        Course course = courseService.getCourse(id);

        // 2. 본인 확인 (강좌 생성자와 로그인 사용자가 같은지 체크)
        if (!course.getCreatedBy().getLoginId().equals(principal.getName())) {
            // 권한이 없으면 403 에러 리턴
            return ResponseEntity.status(403).body("본인의 강좌만 삭제할 수 있습니다.");
        }

        // 3. 강좌 삭제 서비스 호출
        courseService.delete(course);

        // 4. 성공 메시지 반환
        return ResponseEntity.ok("강좌 삭제 성공");
    }

    // 강사 : 강좌 재심사 요청 (반려된 강좌 수정 후 재제출)
    // [역할] 반려(REJECTED)된 강좌를 수정 후 다시 관리자에게 승인 요청
    // [흐름] 프론트엔드 → CourseCreateRequest로 수정된 강좌 정보 전달 → Service에서 상태를 PENDING으로 변경
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/instructor/course/{id}/resubmit")
    public ResponseEntity<?> resubmitCourse(
            @PathVariable("id") Long id,
            // @Valid: 유효성 검사 (title, description 필수 등)
            // @RequestBody: JSON 요청 본문을 CourseCreateRequest 객체로 변환
            @Valid @RequestBody CourseCreateRequest request,
            BindingResult bindingResult,
            // Principal: 현재 로그인한 사용자 정보 (Spring Security)
            Principal principal) {

        // 1. 입력값 유효성 검사
        // 1. 입력값 유효성 검사
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
            // If no field errors but global errors exist, return the first global error
            // message
            if (errors.isEmpty() && bindingResult.hasGlobalErrors()) {
                return ResponseEntity.badRequest().body(bindingResult.getGlobalError().getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }

        // 2. 재심사 요청 처리
        // CourseCreateRequest를 그대로 Service에 전달 (AdminCourseDto 변환 불필요)
        // Service에서 강좌 정보 업데이트 + 상태를 PENDING으로 변경
        courseService.resubmitCourse(id, request, principal.getName());

        return ResponseEntity.ok("재심사 요청이 완료되었습니다.");
    }

    // 강사 : 본인이 개설한 강좌 목록 조회
    @GetMapping("/instructor/course/my-list")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Course>> getMyCourses(Principal principal) {
        String loginId = principal.getName();

        // 서비스에서 실제 List<Course>를 반환하도록 타입을 맞춥니다.
        List<Course> myCourses = (List<Course>) courseService.getCoursesByInstructor(loginId);

        return ResponseEntity.ok(myCourses);
    }

    // ==========================================
    // 🟥 관리자 영역
    // ==========================================

    // 관리자 : 전체 강좌 목록 조회 (승인/미승인 포함)
    @PreAuthorize("hasRole('ADMIN')") // 관리자(ADMIN) 권한만 접근 가능
    @GetMapping("/admin/course")
    public ResponseEntity<List<AdminCourseDto>> adminList() {
        // 1. 모든 강좌 목록을 서비스에서 조회
        return ResponseEntity.ok(courseService.getList().stream()
                // 2. 조회된 엔티티를 관리자용 DTO(AdminCourseDto)로 변환
                .map(AdminCourseDto::fromEntity)
                // 3. 리스트로 수집하여 반환
                .toList());
    }

    // 관리자 : 강좌 상세 조회
    @PreAuthorize("hasRole('ADMIN')") // 관리자만 접근 가능
    @GetMapping("/admin/course/{id}")
    public ResponseEntity<AdminCourseDto> getCourseDetail(@PathVariable("id") Long id) {
        // 1. 서비스에서 ID로 강좌 엔티티 조회
        Course course = courseService.getCourse(id);

        // 2. 관리자용 DTO로 변환하여 반환
        return ResponseEntity.ok(AdminCourseDto.fromEntity(course));
    }

    // 관리자 : 승인 대기중인 강좌 목록 조회
    @PreAuthorize("hasRole('ADMIN')") // 관리자 권한 체크
    @GetMapping("/admin/course/{id}/pending")
    public ResponseEntity<List<AdminCourseDto>> adminPendingList() {
        // 1. 승인 상태가 PENDING인 강좌들을 서비스에서 조회
        return ResponseEntity.ok(courseService.getPendingList().stream()
                // 2. 관리자용 DTO로 변환
                .map(AdminCourseDto::fromEntity)
                // 3. 리스트로 반환
                .toList());
    }

    // 관리자 : 강좌 승인 처리
    @PreAuthorize("hasRole('ADMIN')") // 관리자 권한 체크
    @PostMapping("/admin/course/{id}/approve")
    public ResponseEntity<String> approve(@PathVariable("id") Long id, Principal principal) {
        // 1. 승인 요청을 수행하는 관리자 정보 조회
        Users admin = usersRepository.findByLoginId(principal.getName())
                // 관리자 정보가 없으면 예외 발생
                .orElseThrow(() -> new RuntimeException("관리자 없음"));

        // 2. 대상 강좌 조회
        Course course = courseService.getCourse(id);

        // 3. 강좌 승인 처리 서비스 호출 (상태 변경 및 승인자 정보 기록)
        courseService.approve(course, admin);

        // 4. 성공 메시지 반환
        return ResponseEntity.ok("승인 완료");
    }

    // 관리자 : 강좌 반려 처리
    @PreAuthorize("hasRole('ADMIN')") // 관리자 권한 체크
    @PostMapping("/admin/course/{id}/reject")
    public ResponseEntity<String> reject(@PathVariable("id") Long id, @RequestBody RejectRequest req) {
        // 1. 반려 대상 강좌 조회
        Course course = courseService.getCourse(id);

        // 2. 강좌 반려 처리 서비스 호출 (상태 변경 및 반려 사유 기록)
        courseService.reject(course, req.getReason());

        // 3. 성공 메시지 반환
        return ResponseEntity.ok("반려 완료");
    }

    // 관리자 : 특정 강사의 강좌 목록 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/course/instructor/{instructorId}")
    public ResponseEntity<List<AdminCourseDto>> getInstructorCourses(@PathVariable("instructorId") Long instructorId) {
        // 1. 강사 정보 조회
        Users instructor = usersRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("강사를 찾을 수 없습니다."));

        // 2. 해당 강사의 강좌 목록을 서비스에서 조회
        return ResponseEntity.ok(courseService.getInstructorList(instructor).stream()
                // 3. 관리자용 DTO로 변환
                .map(AdminCourseDto::fromEntity)
                // 4. 리스트로 반환
                .toList());
    }
}
