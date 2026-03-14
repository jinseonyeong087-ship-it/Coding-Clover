package com.mysite.clover.Lecture;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseService;
import com.mysite.clover.Lecture.dto.AdminLectureDto;
import com.mysite.clover.Lecture.dto.BatchApprovalRequest;
import com.mysite.clover.Lecture.dto.InstructorLectureDto;
import com.mysite.clover.Lecture.dto.LectureCreateRequest;
import com.mysite.clover.Lecture.dto.LectureOrderRequest;
import com.mysite.clover.Lecture.dto.LecturePreviewDto;
import com.mysite.clover.Lecture.dto.RejectRequest;
import com.mysite.clover.Lecture.dto.StudentLectureDto;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// 개별 강의 관련 컨트롤러 (생성, 조회, 승인/반려 관리)
@RequiredArgsConstructor
@RestController
public class LectureController {

    private final LectureService lectureService;
    private final CourseService courseService;
    private final UsersRepository usersRepository;
    private final LectureRepository lectureRepository;
    private final YoutubeService youtubeService;

    // ==========================================
    // 비로그인 공개 영역
    // ==========================================

    // 강좌의 강의 미리보기 (비로그인도 접근 가능, 순서와 제목만 제공)
    @GetMapping("/course/{courseId}/lectures/preview")
    public ResponseEntity<List<LecturePreviewDto>> getLecturePreview(@PathVariable("courseId") Long courseId) {
        Course course = courseService.getCourse(courseId);
        return ResponseEntity.ok(lectureService.getPublicListByCourse(course).stream()
                .map(LecturePreviewDto::fromEntity)
                .toList());
    }

    // ==========================================
    // 🟩 수강생 영역
    // ==========================================

    // 수강생용: 내 강좌 내의 강의 목록 조회 (승인된 강의만)
    @PreAuthorize("hasRole('STUDENT')") // 수강생 권한 필요
    @GetMapping("/student/lecture/{courseId}/lectures")
    public ResponseEntity<List<StudentLectureDto>> listByCourse(@PathVariable("courseId") Long courseId) {
        // 1. 강좌 ID로 강좌 정보를 조회
        Course course = courseService.getCourse(courseId);

        // 2. 해당 강좌의 승인된(APPROVED) 강의 목록만 조회하여 DTO로 변환
        // (수강 신청 여부 확인 로직은 서비스나 필터에서 처리된다고 가정, 또는 수강생만 접근 가능하도록 추가 조치 필요)
        return ResponseEntity.ok(lectureService.getLecturesForStudent(course).stream()
                .map(StudentLectureDto::fromEntity)
                .toList());
    }

    // 수강생용: 강의 상세 정보 조회
    @PreAuthorize("hasRole('STUDENT')") // 수강생 권한 필요
    @GetMapping("/student/lecture/{lectureId}")
    public ResponseEntity<StudentLectureDto> getLectureDetail(@PathVariable("lectureId") Long lectureId) {
        // 1. 강의 ID로 상세 정보를 조회하여 DTO로 변환
        return ResponseEntity.ok(StudentLectureDto.fromEntity(lectureService.getLecture(lectureId)));
    }

    // ==========================================
    // 🟨 강사 영역
    // ==========================================

    // 강사용: 본인이 개설한 강좌의 강의 목록 조회 (승인 대기중 등 모든 상태 포함)
    @PreAuthorize("hasRole('INSTRUCTOR')") // 강사 권한 필요
    @GetMapping("/instructor/course/{courseId}/lectures")
    public ResponseEntity<List<InstructorLectureDto>> instructorListByCourse(@PathVariable("courseId") Long courseId,
            Principal principal) {
        // 1. 강좌 존재 여부 확인
        Course course = courseService.getCourse(courseId);

        // 2. 본인이 개설한 강좌인지 확인
        String loginId = principal.getName();
        // 강좌 엔티티의 작성자(createdBy)의 loginId와 비교
        if (!course.getCreatedBy().getLoginId().equals(loginId)) {
            throw new RuntimeException("해당 강좌에 대한 접근 권한이 없습니다.");
        }

        // 3. 해당 강좌의 모든 강의(승인 여부 무관)를 조회하여 반환
        return ResponseEntity.ok(lectureService.getListByCourse(course).stream()
                .map(InstructorLectureDto::fromEntity)
                .toList());
    }

    // 강사용: 신규 강의 업로드 요청
    @PreAuthorize("hasRole('INSTRUCTOR')") // 강사 권한 필요
    @PostMapping("/instructor/lecture/upload")
    public ResponseEntity<String> createLecture(
            @RequestBody @Valid LectureCreateRequest form, // 요청 데이터 유효성 검사
            Principal principal) {
        // 1. 강좌 조회
        Course course = courseService.getCourse(form.getCourseId());

        // 2. 로그인한 강사 정보 조회
        Users instructor = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        // 3. 강의 생성 요청 (초기 상태는 승인 대기)
        lectureService.create(
                course,
                form.getTitle(),
                form.getOrderNo(),
                form.getVideoUrl(),
                form.getDuration(),
                instructor,
                form.getUploadType(),
                form.getScheduledAt());

        // 4. 성공 메시지 반환
        return ResponseEntity.ok("강의 업로드 성공");
    }

    // 강사용: 본인이 업로드한 강의 상세 조회
    @PreAuthorize("hasRole('INSTRUCTOR')") // 강사 권한 필요
    @GetMapping("/instructor/lecture/{lectureId}")
    public ResponseEntity<InstructorLectureDto> instructorGetLecture(@PathVariable("lectureId") Long lectureId) {
        // 1. 강의 상세 조회 후 강사용 DTO로 반환
        return ResponseEntity.ok(InstructorLectureDto.fromEntity(lectureService.getLecture(lectureId)));
    }

    // 사용된 강의 번호 조회 API
    @GetMapping("/orders/{courseId}")
    public ResponseEntity<List<Integer>> getUsedOrderNos(@PathVariable("courseId") Long courseId) {
        List<Integer> usedOrders = lectureRepository.findOrderNosByCourseId(courseId);
        return ResponseEntity.ok(usedOrders);
    }

    // 강사용: 반려된 강의 수정 및 재승인 요청
    @PreAuthorize("hasRole('INSTRUCTOR')") // 강사만 가능
    @PutMapping("/instructor/lecture/{lectureId}/resubmit")
    public ResponseEntity<String> resubmitLecture(
            @PathVariable("lectureId") Long lectureId,
            @RequestBody @Valid LectureCreateRequest form, // 수정할 데이터
            Principal principal) {

        // 서비스의 재승인 로직 호출 (기존 데이터 업데이트 + 상태 PENDING으로 변경)
        lectureService.resubmitLecture(lectureId, form, principal.getName());

        return ResponseEntity.ok("강의 수정 및 재승인 요청 완료");
    }

    // 강사용: 강의 삭제
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @DeleteMapping("/instructor/lecture/{lectureId}/delete")
    public ResponseEntity<String> deleteLecture(@PathVariable("lectureId") Long lectureId, Principal principal) {
        lectureService.deleteLecture(lectureId, principal.getName());
        return ResponseEntity.ok("강의가 삭제되었습니다.");
    }

    // 강사용: 유튜브 재생 시간 조회 (강의 업로드 시 자동 입력을 위해)
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/api/youtube/duration")
    public ResponseEntity<Integer> getYoutubeDuration(@RequestParam("url") String url) {
        int duration = youtubeService.fetchDuration(url);
        return ResponseEntity.ok(duration);
    }

    // ==========================================
    // 🟦 임시 저장 (Draft) 관련 API
    // ==========================================

    // 강사용: 강의 임시 저장 (필수값 없어도 됨)
    // URL: /instructor/lecture/draft
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/instructor/lecture/draft")
    public ResponseEntity<String> saveDraft(
            @RequestBody LectureCreateRequest form, // @Valid 제외 (Null 허용)
            Principal principal) {

        Course course = courseService.getCourse(form.getCourseId());
        Users instructor = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        lectureService.saveDraft(
                course,
                form.getTitle(),
                form.getOrderNo(),
                form.getVideoUrl(),
                form.getDuration(),
                instructor,
                form.getUploadType(),
                form.getScheduledAt());

        return ResponseEntity.ok("강의가 임시 저장되었습니다.");
    }

    // 강사용: 임시 저장된 강의를 최종 제출 (승인 요청)
    // URL: /instructor/lecture/{lectureId}/submit
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PutMapping("/instructor/lecture/{lectureId}/submit")
    public ResponseEntity<String> submitDraft(
            @PathVariable("lectureId") Long lectureId,
            @RequestBody LectureCreateRequest form,
            Principal principal) {

        // 서비스에서 필수값 검증 후 상태 변경 (DRAFT -> PENDING)
        lectureService.submitDraft(lectureId, form, principal.getName());

        return ResponseEntity.ok("강의가 최종 제출(승인 요청) 되었습니다.");
    }

    // 강사용: 강의 순서 변경 (드래그 앤 드롭)
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PutMapping("/instructor/lecture/reorder")
    public ResponseEntity<String> reorderLectures(@RequestBody LectureOrderRequest request) {
        lectureService.reorderLectures(request.getOrders());
        return ResponseEntity.ok("강의 순서가 변경되었습니다.");
    }

    // ==========================================
    // 🟥 관리자 영역
    // ==========================================

    // 관리자용: 특정 강좌의 모든 강의 목록 조회 (작성자 체크 없음)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/course/{courseId}/lectures")
    public ResponseEntity<List<InstructorLectureDto>> adminListByCourse(@PathVariable("courseId") Long courseId) {
        // 1. 강좌 존재 여부 확인
        Course course = courseService.getCourse(courseId);
        // 2. 작성자(Principal) 확인 없이 해당 강좌의 모든 강의 조회
        return ResponseEntity.ok(lectureService.getListByCourse(course).stream()
                .map(InstructorLectureDto::fromEntity)
                .toList());
    }

    // 강의 리스트 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/lectures")
    public ResponseEntity<List<InstructorLectureDto>> adminGetAllLectures() {
        // 1. 서비스의 getAllList() 메서드 호출
        List<Lecture> allLectures = lectureService.getAllList();

        // 2. 엔티티 리스트를 DTO 리스트로 변환하여 반환
        return ResponseEntity.ok(allLectures.stream()
                .map(InstructorLectureDto::fromEntity)
                .toList());
    }

    // 관리자: 강의 상세 조회 (승인/반려 여부 상관없이 조회 가능)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/lectures/{lectureId}")
    public ResponseEntity<InstructorLectureDto> adminGetLectureDetail(@PathVariable("lectureId") Long lectureId) {
        // 1. 강의 ID로 상세 정보를 조회 (작성자 체크 없음)
        Lecture lecture = lectureService.getLecture(lectureId);

        // 2. DTO로 변환하여 반환
        return ResponseEntity.ok(InstructorLectureDto.fromEntity(lecture));
    }

    // 관리자: 강의 승인 처리
    @PreAuthorize("hasRole('ADMIN')") // 관리자 권한 필요
    @PostMapping("/admin/lectures/{lectureId}/approve")
    public ResponseEntity<String> approveLecture(
            @PathVariable("lectureId") Long lectureId,
            Principal principal) {
        // 1. 강의 조회
        Lecture lecture = lectureService.getLecture(lectureId);

        // 2. 승인 처리하는 관리자 정보 조회
        Users admin = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("관리자 없음"));

        // 3. 강의 승인 처리 서비스 호출
        lectureService.approve(lecture, admin);

        // 4. 성공 메시지
        return ResponseEntity.ok("승인 완료");
    }

    // 관리자: 일괄 승인 처리
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/lectures/batch-approve")
    // @RequestBody BatchApprovalRequest request: 요청 본문에서 BatchApprovalRequest 객체를
    // 받음
    // Principal principal: 로그인한 사용자의 정보를 받음
    public ResponseEntity<String> batchApprove(
            // @RequestBody: 요청 본문에서 BatchApprovalRequest 객체를 받음
            @RequestBody BatchApprovalRequest request,
            // Principal: 로그인한 사용자의 정보를 받음
            Principal principal) {

        // 1. 로그인한 관리자 정보 조회
        Users admin = usersRepository.findByLoginId(principal.getName())
                // orElseThrow: Optional에서 값을 가져오고, 값이 없으면 예외를 발생시킴
                .orElseThrow(() -> new RuntimeException("관리자 정보를 찾을 수 없습니다."));

        // 2. 일괄 승인 처리 서비스 호출
        lectureService.approveMultiple(request.getLectureIds(), admin);

        // 3. 성공 메시지 반환
        return ResponseEntity.ok("선택한 " + request.getLectureIds().size() + "건의 강의가 승인되었습니다.");
    }

    // 관리자: 강의 반려 처리
    @PreAuthorize("hasRole('ADMIN')") // 관리자 권한 필요
    @PostMapping("/admin/lectures/{lectureId}/reject")
    public ResponseEntity<String> rejectLecture(
            @PathVariable("lectureId") Long lectureId,
            @RequestBody RejectRequest dto) { // 반려 사유가 담긴 DTO
        // 1. 강의 조회
        Lecture lecture = lectureService.getLecture(lectureId);

        // 2. 강의 반려 처리 서비스 호출
        lectureService.reject(lecture, dto.getReason());

        // 3. 성공 메시지
        return ResponseEntity.ok("반려 완료");
    }

    // 관리자: 일괄 반려 처리
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/lectures/batch-reject")
    // @RequestBody BatchApprovalRequest request: 요청 본문에서 BatchApprovalRequest 객체를
    // 받음
    public ResponseEntity<String> batchReject(@RequestBody BatchApprovalRequest request) {

        // 1. 일괄 반려 처리 서비스 호출
        lectureService.rejectMultiple(request.getLectureIds(), request.getRejectReason());

        // 2. 성공 메시지 반환
        return ResponseEntity.ok("선택한 " + request.getLectureIds().size() + "건의 강의가 반려되었습니다.");
    }

    // 관리자: 강의 강제 비활성화
    @PreAuthorize("hasRole('ADMIN')") // 관리자 권한 필요
    @PostMapping("/admin/lectures/{lectureId}/inactive")
    public ResponseEntity<String> inactiveLecture(@PathVariable("lectureId") Long lectureId) {
        // 1. 강의 조회
        Lecture lecture = lectureService.getLecture(lectureId);

        // 2. 강의 비활성화 처리 서비스 호출
        lectureService.inactive(lecture);

        // 3. 성공 메시지
        return ResponseEntity.ok("비활성화 완료");
    }

    // 관리자: 승인 대기 중인 강의 목록 조회
    @PreAuthorize("hasRole('ADMIN')") // 관리자 권한 필요
    @GetMapping("/admin/lectures/pending")
    public ResponseEntity<List<AdminLectureDto>> adminPendingList() {
        // 1. 승인 대기 중(PENDING)인 강의들만 조회하여 반환
        return ResponseEntity.ok(lectureService.getPendingList().stream()
                .map(AdminLectureDto::fromEntity)
                .toList());
    }
}
