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

    // ==========================================
    // 🟩 수강생 영역
    // ==========================================

    // 수강생용: 내 강좌 내의 강의 목록 조회 (승인된 강의만)
    @PreAuthorize("hasRole('STUDENT')") // 수강생 권한 필요
    @GetMapping("/student/lecture/{courseId}/lectures")
    public ResponseEntity<List<StudentLectureDto>> listByCourse(@PathVariable Long courseId) {
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
    public ResponseEntity<StudentLectureDto> getLectureDetail(@PathVariable Long lectureId) {
        // 1. 강의 ID로 상세 정보를 조회하여 DTO로 변환
        return ResponseEntity.ok(StudentLectureDto.fromEntity(lectureService.getLecture(lectureId)));
    }

    // ==========================================
    // 🟨 강사 영역
    // ==========================================

    // 강사용: 본인이 개설한 강좌의 강의 목록 조회 (승인 대기중 등 모든 상태 포함)
    @PreAuthorize("hasRole('INSTRUCTOR')") // 강사 권한 필요
    @GetMapping("/instructor/lecture/{courseId}")
    public ResponseEntity<List<InstructorLectureDto>> instructorListByCourse(@PathVariable Long courseId, Principal principal) {
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
    public ResponseEntity<InstructorLectureDto> instructorGetLecture(@PathVariable Long lectureId) {
        // 1. 강의 상세 조회 후 강사용 DTO로 반환
        return ResponseEntity.ok(InstructorLectureDto.fromEntity(lectureService.getLecture(lectureId)));
    }

    // ==========================================
    // 🟥 관리자 영역
    // ==========================================

    // 관리자: 전체 강의 목록 조회 (모든 강의)
    @PreAuthorize("hasRole('ADMIN')") // 관리자 권한 필요
    @GetMapping("/admin/lectures")
    public ResponseEntity<List<AdminLectureDto>> adminList() {
        // 1. 시스템의 모든 강의 목록을 조회하여 관리자용 DTO로 반환
        return ResponseEntity.ok(lectureService.getAllList().stream()
                .map(AdminLectureDto::fromEntity)
                .toList());
    }

    // 관리자: 강의 승인 처리
    @PreAuthorize("hasRole('ADMIN')") // 관리자 권한 필요
    @PostMapping("/admin/lectures/{lectureId}/approve")
    public ResponseEntity<String> approveLecture(
            @PathVariable Long lectureId,
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
    // @RequestBody BatchApprovalRequest request: 요청 본문에서 BatchApprovalRequest 객체를 받음
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
            @PathVariable Long lectureId,
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
    // @RequestBody BatchApprovalRequest request: 요청 본문에서 BatchApprovalRequest 객체를 받음
    public ResponseEntity<String> batchReject(@RequestBody BatchApprovalRequest request) {
        
        // 1. 일괄 반려 처리 서비스 호출
        lectureService.rejectMultiple(request.getLectureIds(), request.getRejectReason());
        
        // 2. 성공 메시지 반환
        return ResponseEntity.ok("선택한 " + request.getLectureIds().size() + "건의 강의가 반려되었습니다.");
    }

    // 관리자: 강의 강제 비활성화
    @PreAuthorize("hasRole('ADMIN')") // 관리자 권한 필요
    @PostMapping("/admin/lectures/{lectureId}/inactive")
    public ResponseEntity<String> inactiveLecture(@PathVariable Long lectureId) {
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
