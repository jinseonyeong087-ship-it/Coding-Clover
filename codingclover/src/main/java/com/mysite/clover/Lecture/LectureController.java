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

    // 강좌별 강의 목록 조회 (수강생용)
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/lecture/{courseId}/lectures")
    public ResponseEntity<List<StudentLectureDto>> listByCourse(@PathVariable Long courseId) {
        Course course = courseService.getCourse(courseId);
        // 승인된 강의만 반환
        return ResponseEntity.ok(lectureService.getPublicListByCourse(course).stream()
                .map(StudentLectureDto::fromEntity)
                .toList());
    }

    // 강의 상세 조회 (수강생용)
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/lecture/{lectureId}")
    public ResponseEntity<StudentLectureDto> getLectureDetail(@PathVariable Long lectureId) {
        return ResponseEntity.ok(StudentLectureDto.fromEntity(lectureService.getLecture(lectureId)));
    }

    // ==========================================
    // 🟨 강사 영역
    // ==========================================

    // 강좌별 강의 목록 조회 (강사용)
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/lecture/{courseId}")
    public ResponseEntity<List<InstructorLectureDto>> instructorListByCourse(@PathVariable Long courseId) {
        Course course = courseService.getCourse(courseId);
        // 본인 강좌인지 확인 로직 필요
        return ResponseEntity.ok(lectureService.getListByCourse(course).stream()
                .map(InstructorLectureDto::fromEntity)
                .toList());
    }

    // 강의 업로드 요청 (강사용)
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

    // 강의 상세 조회 (강사용)
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/lecture/{lectureId}")
    public ResponseEntity<InstructorLectureDto> instructorGetLecture(@PathVariable Long lectureId) {
        return ResponseEntity.ok(InstructorLectureDto.fromEntity(lectureService.getLecture(lectureId)));
    }

    // ==========================================
    // 🟥 관리자 영역
    // ==========================================

    // 관리자 : 전체 강의 목록 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/lectures")
    public ResponseEntity<List<AdminLectureDto>> adminList() {
        // 전체 강의 목록 조회 Service 메소드 필요 (일단 생략 or 추가)
        return ResponseEntity.ok(List.of()); // 임시
    }

    // 관리자 : 강의 승인
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

    // 관리자 : 강의 반려
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/lectures/{lectureId}/reject")
    public ResponseEntity<String> rejectLecture(
            @PathVariable Long lectureId,
            @RequestBody RejectRequest dto) {
        Lecture lecture = lectureService.getLecture(lectureId);
        lectureService.reject(lecture, dto.getReason());
        return ResponseEntity.ok("반려 완료");
    }

    // 관리자 : 강의 비활성화
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/lectures/{lectureId}/inactive")
    public ResponseEntity<String> inactiveLecture(@PathVariable Long lectureId) {
        Lecture lecture = lectureService.getLecture(lectureId);
        lectureService.inactive(lecture);
        return ResponseEntity.ok("비활성화 완료");
    }

    // 관리자 : 승인 대기 강의 목록 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/lectures/pending")
    public ResponseEntity<List<AdminLectureDto>> adminPendingList() {
        return ResponseEntity.ok(lectureService.getPendingList().stream()
                .map(AdminLectureDto::fromEntity)
                .toList());
    }
}
