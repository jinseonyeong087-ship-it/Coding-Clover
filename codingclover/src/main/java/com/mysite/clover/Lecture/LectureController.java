package com.mysite.clover.Lecture;

import java.security.Principal;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseService;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/courses")
public class LectureController {

    private final LectureService lectureService;
    private final CourseService courseService;
    private final UsersRepository usersRepository;

    // ✅ 강좌별 강의 목록
    @GetMapping("/student/course/{courseId}/lectures")
    public List<Lecture> listByCourse(@PathVariable Long courseId) {
        Course course = courseService.getCourse(courseId);
        return lectureService.getListByCourse(course);
    }

    // ✅ 강의 생성 (강사용)
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/instructor/lecture/upload")
    public void createLecture(
            @PathVariable Long courseId,
            @RequestBody LectureRequest dto,
            Principal principal
    ) {
        Course course = courseService.getCourse(courseId);
        Users instructor = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        lectureService.create(
                course,
                dto.getTitle(),
                dto.getOrderNo(),
                dto.getVideoUrl(),
                dto.getDuration(),
                instructor
        );
    }

    // ✅ 관리자 승인
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{lectureId}/approve")
    public void approveLecture(
            @PathVariable Long lectureId,
            Principal principal
    ) {
        Lecture lecture = lectureService.getLecture(lectureId);
        Users admin = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("관리자 없음"));

        lectureService.approve(lecture, admin);
    }

    // ✅ 관리자 반려
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{lectureId}/reject")
    public void rejectLecture(
        @PathVariable Long lectureId,
        @RequestBody RejectRequest dto
  ) {
    Lecture lecture = lectureService.getLecture(lectureId);
    lectureService.reject(lecture, dto.getReason());
  }


    // ✅ 관리자 비활성화
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{lectureId}/inactive")
    public void inactiveLecture(@PathVariable Long lectureId) {
        Lecture lecture = lectureService.getLecture(lectureId);
        lectureService.inactive(lecture);
    }
}
