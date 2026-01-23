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

    /**
     * 전체 강좌 목록 조회 (공통)
     * 누구나 접근 가능하며, 승인된 강좌 목록을 반환합니다.
     * 
     * @return 승인된 강좌 목록 (StudentCourseDto)
     */
    @GetMapping("/course")
    public ResponseEntity<List<StudentCourseDto>> list() {
        return ResponseEntity.ok(courseService.getPublicList().stream()
                .map(StudentCourseDto::fromEntity)
                .toList());
    }

    /**
     * 레벨별 강좌 목록 조회
     * 특정 레벨(예: 초급, 중급, 고급)에 해당하는 승인된 강좌 목록을 반환합니다.
     * 
     * @param level 강좌 레벨
     * @return 해당 레벨의 강좌 목록
     */
    @GetMapping("/course/level/{level}")
    public ResponseEntity<List<StudentCourseDto>> listByLevel(@PathVariable int level) {
        return ResponseEntity.ok(courseService.getPublicListByLevel(level).stream()
                .map(StudentCourseDto::fromEntity)
                .toList());
    }

    /**
     * 강좌 상세 조회 (비로그인/공통)
     * 강좌의 기본 정보를 조회합니다. 맛보기 강의 등이 포함될 수 있습니다.
     * 
     * @param id 강좌 ID
     * @return 강좌 상세 정보
     */
    @GetMapping("/course/{id}")
    public ResponseEntity<StudentCourseDto> detail(@PathVariable Long id) {
        return ResponseEntity.ok(StudentCourseDto.fromEntity(courseService.getCourse(id)));
    }

    // ==========================================
    // 🟩 수강생 영역
    // ==========================================

    /**
     * 수강생용 강좌 상세 조회
     * 수강생 권한으로 접근하며, 커리큘럼 등 상세 정보를 포함할 수 있습니다.
     * 
     * @param courseId 강좌 ID
     * @return 강좌 상세 정보
     */
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/course/{courseId}")
    public ResponseEntity<StudentCourseDto> studentCourseDetail(@PathVariable Long courseId) {
        return ResponseEntity.ok(StudentCourseDto.fromEntity(courseService.getCourse(courseId)));
    }

    // 수강 내역(active/completed) 조회는 EnrollmentController (/student/enrollment/...) 에서
    // 담당

    // ==========================================
    // 🟨 강사 영역
    // ==========================================

    /**
     * 강사 : 내 강좌 목록 조회
     * 본인이 개설한 강좌 목록을 조회합니다. 승인 대기, 반려 상태 등도 포함됩니다.
     * 
     * @param principal 인증된 사용자 정보
     * @return 본인의 강좌 목록 (InstructorCourseDto)
     */
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course")
    public ResponseEntity<List<InstructorCourseDto>> instructorList(Principal principal) {
        Users user = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 없음"));
        return ResponseEntity.ok(courseService.getInstructorList(user).stream()
                .map(InstructorCourseDto::fromEntity)
                .toList());
    }

    /**
     * 강사 : 신규 강좌 개설 요청
     * 새로운 강좌를 생성하고 승인을 요청합니다. 초기 상태는 PENDING 입니다.
     * 
     * @param courseForm 강좌 생성 요청 데이터
     * @param principal  인증된 사용자 정보
     * @return 요청 결과 메시지
     */

    @PostMapping("/instructor/course/new")
    public ResponseEntity<?> createCourse(
            @Valid @RequestBody CourseCreateRequest request,
            BindingResult bindingResult,
            Principal principal) {

        // 1. 유효성 검사 (DTO에 설정한 @NotBlank 등을 체크)
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest()
                    .body(bindingResult.getAllErrors().get(0).getDefaultMessage());
        }

        // 2. Principal을 통해 실제 로그인한 유저(강사)를 찾음
        // 이 방식이 instructorId를 직접 쓰는 것보다 훨씬 안전합니다.
        Users loginUser = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 정보가 없습니다."));

        // 3. 서비스 호출 (DTO에서 받은 값들과 찾은 유저 객체를 넘김)
        courseService.create(
                request.getTitle(),
                request.getDescription(),
                request.getLevel(),
                request.getPrice(),
                loginUser,
                CourseProposalStatus.PENDING);

        return ResponseEntity.ok("강좌 개설 신청이 완료되었습니다.");
    }

    /**
     * 강사 : 강좌 상세 조회
     * 본인의 강좌 상세 정보를 조회합니다. 반려 사유 등을 확인할 수 있습니다.
     * 
     * @param id 강좌 ID
     * @return 강좌 상세 정보 (InstructorCourseDto)
     */
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course/{id}")
    public ResponseEntity<InstructorCourseDto> instructorCourseDetail(@PathVariable Long id) {
        return ResponseEntity.ok(InstructorCourseDto.fromEntity(courseService.getCourse(id)));
    }

    /**
     * 강사 : 강좌 삭제
     * 본인의 강좌를 삭제합니다. (수강생이 없는 경우 등 조건 필요 가능)
     * 
     * @param id 삭제할 강좌 ID
     * @return 삭제 결과 메시지
     */
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @DeleteMapping("/instructor/course/{id}/delete")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        Course course = courseService.getCourse(id);
        // 작성자 본인 확인 로직 필요 (생략 가능하나 추가 추천)
        courseService.delete(course);
        return ResponseEntity.ok("강좌 삭제 성공");
    }

    // ==========================================
    // 🟥 관리자 영역
    // ==========================================

    /**
     * 관리자 : 전체 강좌 목록 조회
     * 시스템 상의 모든 강좌를 조회합니다.
     * 
     * @return 전체 강좌 목록 (AdminCourseDto)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/course")
    public ResponseEntity<List<AdminCourseDto>> adminList() {
        return ResponseEntity.ok(courseService.getList().stream()
                .map(AdminCourseDto::fromEntity)
                .toList());
    }

    /**
     * 관리자 : 승인 대기중인 강좌 목록 조회
     * 승인이 필요한 강좌 목록을 조회합니다.
     * 
     * @return 승인 대기 강좌 목록
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/course/pending")
    public ResponseEntity<List<AdminCourseDto>> adminPendingList() {
        return ResponseEntity.ok(courseService.getPendingList().stream()
                .map(AdminCourseDto::fromEntity)
                .toList());
    }

    /**
     * 관리자 : 강좌 승인
     * 대기 중인 강좌를 승인하여 공개 상태로 변경합니다.
     * 
     * @param id        강좌 ID
     * @param principal 관리자 정보
     * @return 승인 결과 메시지
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/course/{id}/approve")
    public ResponseEntity<String> approve(@PathVariable Long id, Principal principal) {
        Users admin = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("관리자 없음"));
        Course course = courseService.getCourse(id);
        courseService.approve(course, admin);
        return ResponseEntity.ok("승인 완료");
    }

    /**
     * 관리자 : 강좌 반려
     * 강좌 개설 요청을 반려합니다. 반려 사유를 포함해야 합니다.
     * 
     * @param id  강좌 ID
     * @param req 반려 요청 데이터 (사유 포함)
     * @return 반려 결과 메시지
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/course/{id}/reject")
    public ResponseEntity<String> reject(@PathVariable Long id, @RequestBody RejectRequest req) {
        Course course = courseService.getCourse(id);
        courseService.reject(course, req.getReason());
        return ResponseEntity.ok("반려 완료");
    }
}
