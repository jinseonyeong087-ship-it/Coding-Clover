package com.mysite.clover.Lecture;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseService;
import com.mysite.clover.Lecture.dto.AdminLectureDto;
import com.mysite.clover.Lecture.dto.InstructorLectureDto;
import com.mysite.clover.Lecture.dto.LectureCreateRequest;
import com.mysite.clover.Lecture.dto.StudentLectureDto;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
public class LectureController {

    private final LectureService lectureService;
    private final CourseService courseService;
    private final UsersRepository usersRepository;

    // ==========================================
    // 🟩 수강생 영역
    // ==========================================

    /**
     * 강좌별 강의 목록 조회 (수강생용)
     * 특정 강좌에 속한 승인된 강의 목록을 조회합니다.
     * 
     * @param courseId 강좌 ID
     * @return 승인된 강의 목록 (StudentLectureDto)
     */
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/course/{courseId}/lectures")
    public ResponseEntity<List<StudentLectureDto>> listByCourse(@PathVariable Long courseId) {
        Course course = courseService.getCourse(courseId);
        // 승인된 강의만 반환
        return ResponseEntity.ok(lectureService.getPublicListByCourse(course).stream()
                .map(StudentLectureDto::fromEntity)
                .toList());
    }

    /**
     * 강의 상세 조회 (수강생용)
     * 강의의 상세 정보, 동영상 URL 등을 조회합니다.
     * 
     * @param lectureId 강의 ID
     * @return 강의 상세 정보
     */
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/lecture/{lectureId}")
    public ResponseEntity<StudentLectureDto> getLectureDetail(@PathVariable Long lectureId) {
        return ResponseEntity.ok(StudentLectureDto.fromEntity(lectureService.getLecture(lectureId)));
    }

    // 진도율 업데이트 (/student/lecture/{lectureId}/progress) - LectureProgress
    // Entity/Service 필요. 추후 구현.

    // ==========================================
    // 🟨 강사 영역
    // ==========================================

    /**
     * 강사 : 강좌별 강의 목록 조회
     * 본인의 강좌에 속한 모든 강의(승인, 대기, 반려 포함)를 조회합니다.
     * 
     * @param courseId 강좌 ID
     * @return 강의 목록 (InstructorLectureDto)
     */
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course/{courseId}/lecture")
    public ResponseEntity<List<InstructorLectureDto>> instructorListByCourse(@PathVariable Long courseId) {
        Course course = courseService.getCourse(courseId);
        // 본인 강좌인지 확인 로직 필요
        return ResponseEntity.ok(lectureService.getListByCourse(course).stream()
                .map(InstructorLectureDto::fromEntity)
                .toList());
    }

    /**
     * 강사 : 강의 업로드 요청
     * 새로운 강의를 생성하고 승인을 요청합니다.
     * 
     * @param form      강의 생성 요청 데이터
     * @param principal 인증된 사용자 정보
     * @return 업로드 결과 메시지
     */
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/instructor/lecture/upload")
    public ResponseEntity<String> createLecture(
            @RequestBody @Valid LectureCreateRequest form,
            Principal principal) {
        Course course = courseService.getCourse(form.getCourseId());
        Users instructor = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        lectureService.create(
                course,
                form.getTitle(),
                form.getOrderNo(),
                form.getVideoUrl(),
                form.getDuration(),
                instructor);

        return ResponseEntity.ok("강의 업로드 성공");
    }

    /**
     * 강사 : 강의 상세 조회
     * 본인의 강의 상세 정보를 조회합니다. 상태 및 반려 사유 등을 확인할 수 있습니다.
     * 
     * @param lectureId 강의 ID
     * @return 강의 상세 정보
     */
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course/{courseId}/lecture/{lectureId}")
    public ResponseEntity<InstructorLectureDto> instructorGetLecture(@PathVariable Long lectureId) {
        return ResponseEntity.ok(InstructorLectureDto.fromEntity(lectureService.getLecture(lectureId)));
    }

    // ==========================================
    // 🟥 관리자 영역
    // ==========================================

    /**
     * 관리자 : 전체 강의 목록 조회
     * 시스템 상의 모든 강의를 조회합니다.
     * 
     * @return 전체 강의 목록
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/lectures")
    public ResponseEntity<List<AdminLectureDto>> adminList() {
        // 전체 강의 목록 조회 Service 메소드 필요 (일단 생략 or 추가)
        return ResponseEntity.ok(List.of()); // 임시
    }

    /**
     * 관리자 : 강의 승인
     * 대기 중인 강의를 승인하여 공개 상태로 변경합니다.
     * 
     * @param lectureId 강의 ID
     * @param principal 관리자 정보
     * @return 승인 결과 메시지
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/lectures/{lectureId}/approve")
    public ResponseEntity<String> approveLecture(
            @PathVariable Long lectureId,
            Principal principal) {
        Lecture lecture = lectureService.getLecture(lectureId);
        Users admin = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("관리자 없음"));

        lectureService.approve(lecture, admin);
        return ResponseEntity.ok("승인 완료");
    }

    /**
     * 관리자 : 강의 반려
     * 강의 승인 요청을 반려합니다. 반려 사유를 포함해야 합니다.
     * 
     * @param lectureId 강의 ID
     * @param dto       반려 요청 데이터
     * @return 반려 결과 메시지
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/lectures/{lectureId}/reject")
    public ResponseEntity<String> rejectLecture(
            @PathVariable Long lectureId,
            @RequestBody RejectRequest dto) {
        Lecture lecture = lectureService.getLecture(lectureId);
        lectureService.reject(lecture, dto.getReason());
        return ResponseEntity.ok("반려 완료");
    }

    /**
     * 관리자 : 강의 비활성화
     * 강의를 비활성화(차단) 상태로 변경합니다.
     * 
     * @param lectureId 강의 ID
     * @return 비활성화 결과 메시지
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/lectures/{lectureId}/inactive")
    public ResponseEntity<String> inactiveLecture(@PathVariable Long lectureId) {
        Lecture lecture = lectureService.getLecture(lectureId);
        lectureService.inactive(lecture);
        return ResponseEntity.ok("비활성화 완료");
    }

    /**
     * 관리자 : 승인 대기 강의 목록 조회
     * 승인이 필요한 강의 목록을 조회합니다.
     * 
     * @return 승인 대기 강의 목록
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/lectures/pending")
    public ResponseEntity<List<AdminLectureDto>> adminPendingList() {
        return ResponseEntity.ok(lectureService.getPendingList().stream()
                .map(AdminLectureDto::fromEntity)
                .toList());
    }
}
