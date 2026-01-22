package com.mysite.clover.Exam;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
public class ExamController {

    private final ExamService examService;
    private final UsersRepository usersRepository;

    // ==========================================
    // 🟩 수강생 영역
    // ==========================================

    // 시험 목록 (활성 강좌의 시험)
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/exam")
    public ResponseEntity<List<Exam>> listStudentExams(Principal principal) {
        Users student = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("학생 없음"));
        return ResponseEntity.ok(examService.getStudentExams(student));
    }

    // 시험 응시 화면 (상세 정보)
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/exam/{examId}")
    public ResponseEntity<Exam> getExamDetail(@PathVariable Long examId) {
        return ResponseEntity.ok(examService.getExam(examId));
    }

    // 시험 답안 제출 (채점)
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/student/exam/{examId}/submit")
    public ResponseEntity<String> submitExam(
            @PathVariable Long examId,
            @RequestBody Integer score, // 임시: 점수를 직접 받음 (실제론 답안을 받아 채점)
            Principal principal) {

        Users student = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("학생 없음"));
        Exam exam = examService.getExam(examId);

        // 간단한 채점 로직
        boolean passed = score >= exam.getPassScore();

        examService.recordAttempt(exam, student, score, passed);

        return ResponseEntity.ok("시험 제출 완료. 결과: " + (passed ? "통과" : "과락"));
    }

    // 개인 결과 상세
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/exam/{examId}/result")
    public ResponseEntity<List<ExamAttemptDto>> getExamResult(
            @PathVariable Long examId,
            Principal principal) {

        Users student = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("학생 없음"));

        List<ExamAttempt> attempts = examService.getAttemptsByExamAndUser(examId, student);
        List<ExamAttemptDto> dtos = attempts.stream()
                .map(ExamAttemptDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // ==========================================
    // 🟨 강사 영역
    // ==========================================

    // 시험 관리 (전체 목록)
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/exam")
    public ResponseEntity<List<Exam>> listInstructorExams(Principal principal) {
        Users instructor = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("강사 없음"));
        return ResponseEntity.ok(examService.getExamsByInstructor(instructor));
    }

    // 시험 등록
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/instructor/exam/new")
    public ResponseEntity<String> createExam(
            @RequestBody @Valid ExamForm form,
            Principal principal) {

        Users instructor = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("강사 없음"));

        examService.createExam(
                form.getCourseId(),
                form.getTitle(),
                form.getTimeLimit(),
                form.getLevel(),
                form.getPassScore(),
                instructor);

        return ResponseEntity.ok("시험 등록 성공");
    }

    // 시험 상세/수정
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/exam/{id}")
    public ResponseEntity<Exam> getInstructorExam(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExam(id));
    }

    // 강좌별 시험 목록
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course/{courseId}/exam")
    public ResponseEntity<List<Exam>> listExamsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(examService.getExamsByCourse(courseId));
    }

    // 시험 응시자 목록 (결과 조회)
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/course/{courseId}/exam/{examId}/attempts")
    public ResponseEntity<List<ExamAttemptDto>> listExamAttempts(
            @PathVariable Long examId) {
        List<ExamAttempt> attempts = examService.getAttemptsByExam(examId);
        List<ExamAttemptDto> dtos = attempts.stream()
                .map(ExamAttemptDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ==========================================
    // 🟥 관리자 영역
    // ==========================================

    // 시험 로그
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/logs/exams")
    public ResponseEntity<List<ExamAttemptDto>> getExamLogs() {
        List<ExamAttempt> attempts = examService.getAllAttempts();
        List<ExamAttemptDto> dtos = attempts.stream()
                .map(ExamAttemptDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
