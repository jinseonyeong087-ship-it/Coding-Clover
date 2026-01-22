package com.mysite.clover.Lecture;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseService;
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

    // 강좌별 강의 목록
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/course/{courseId}/lectures")
    public ResponseEntity<List<Lecture>> listByCourse(@PathVariable Long courseId) {
        Course course = courseService.getCourse(courseId);
        // 여기서 승인된 강의만 보여줘야 하는지? 보통 그렇다. Service에서 필터링 필요할 수 있음.
        // 현재는 getListByCourse가 모든 강의 반환.
        // TODO: 수강생에게는 PENDING/REJECTED/INACTIVE 제외하고 APPROVED만 보여주도록 Service 수정 필요.
        // 우선 기존대로 반환.
        return ResponseEntity.ok(lectureService.getListByCourse(course));
    }

    // 강의 시청 (상세)
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/lecture/{lectureId}")
    public ResponseEntity<Lecture> getLectureDetail(@PathVariable Long lectureId) {
        return ResponseEntity.ok(lectureService.getLecture(lectureId));
    }

    // 진도율 업데이트 (/student/lecture/{lectureId}/progress) - LectureProgress
    // Entity/Service 필요. 추후 구현.

    // ==========================================
    // 🟨 강사 영역
    // ==========================================

    // 강의 목록 (강사 시점 - 모든 상태 확인 가능)
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course/{courseId}/lecture")
    public ResponseEntity<List<Lecture>> instructorListByCourse(@PathVariable Long courseId) {
        Course course = courseService.getCourse(courseId);
        // 본인 강좌인지 확인 로직 필요
        return ResponseEntity.ok(lectureService.getListByCourse(course));
    }

    // 강의 업로드 요청
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/instructor/lecture/upload")
    public ResponseEntity<String> createLecture(
            @RequestBody @Valid LectureForm form,
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

    // 강의 상세/수정 (강사용)
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course/{courseId}/lecture/{lectureId}")
    public ResponseEntity<Lecture> instructorGetLecture(@PathVariable Long lectureId) {
        return ResponseEntity.ok(lectureService.getLecture(lectureId));
    }

    // ==========================================
    // 🟥 관리자 영역
    // ==========================================

    // 강의 관리 (전체 목록 - 필요한 경우)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/lectures")
    public ResponseEntity<List<Lecture>> adminList() {
        // 전체 강의 목록 조회 Service 메소드 필요 (일단 생략 or 추가)
        return ResponseEntity.ok(List.of()); // 임시
    }

    // 강의 승인
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

    // 강의 반려
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/lectures/{lectureId}/reject")
    public ResponseEntity<String> rejectLecture(
            @PathVariable Long lectureId,
            @RequestBody RejectRequest dto) {
        Lecture lecture = lectureService.getLecture(lectureId);
        lectureService.reject(lecture, dto.getReason());
        return ResponseEntity.ok("반려 완료");
    }

    // 강의 비활성화 (차단)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/lectures/{lectureId}/inactive")
    public ResponseEntity<String> inactiveLecture(@PathVariable Long lectureId) {
        Lecture lecture = lectureService.getLecture(lectureId);
        lectureService.inactive(lecture);
        return ResponseEntity.ok("비활성화 완료");
    }

    // 강의 승인 대기 목록 (url.md에는 없지만 필요)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/lectures/pending")
    public ResponseEntity<List<Lecture>> adminPendingList() {
        // Service에 getPendingList 추가 필요
        return ResponseEntity.ok(List.of()); // 임시
    }
}
