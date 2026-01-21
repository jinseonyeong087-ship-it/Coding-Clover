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

    // ✅ 강좌별 강의 목록 (수강생)
    @GetMapping("/student/course/{courseId}/lectures")
    public ResponseEntity<List<Lecture>> listByCourse(@PathVariable Long courseId) {
        Course course = courseService.getCourse(courseId);
        return ResponseEntity.ok(lectureService.getListByCourse(course));
    }

    // ✅ 강의 생성 (강사인 경우에만)
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

    // ✅ 관리자 승인
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

    // ✅ 관리자 반려
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/lectures/{lectureId}/reject")
    public ResponseEntity<String> rejectLecture(
            @PathVariable Long lectureId,
            @RequestBody RejectRequest dto) {
        Lecture lecture = lectureService.getLecture(lectureId);
        lectureService.reject(lecture, dto.getReason());
        return ResponseEntity.ok("반려 완료");
    }

    // ✅ 관리자 비활성화
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/lectures/{lectureId}/inactive")
    public ResponseEntity<String> inactiveLecture(@PathVariable Long lectureId) {
        Lecture lecture = lectureService.getLecture(lectureId);
        lectureService.inactive(lecture);
        return ResponseEntity.ok("비활성화 완료");
    }
}
