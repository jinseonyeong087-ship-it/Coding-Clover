package com.mysite.clover.Exam;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.mysite.clover.Exam.dto.ExamCreateRequest;
import com.mysite.clover.Exam.dto.InstructorExamDto;
import com.mysite.clover.Exam.dto.StudentExamDto;
import com.mysite.clover.ExamAttempt.ExamAttempt;
import com.mysite.clover.ExamAttempt.dto.ExamAttemptDto;
import com.mysite.clover.ScoreHistory.dto.ScoreHistoryDto;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 시험 컨트롤러
 * 시험 관련 API 요청을 처리합니다.
 * 수강생(응시, 성적 조회), 강사(시험 출제, 응시생 관리), 관리자(로그 조회) 등
 * 역할별로 세분화된 기능을 제공합니다.
 */
@RequiredArgsConstructor
@RestController
public class ExamController {

        private final ExamService examService;
        private final UsersRepository usersRepository;

        // ==========================================
        // 🟩 수강생 영역
        // ==========================================

        @PreAuthorize("hasRole('STUDENT')")
        @GetMapping("/student/exam")
        public ResponseEntity<List<StudentExamDto>> listStudentExams(Principal principal) {
                Users student = usersRepository.findByLoginId(principal.getName())
                                .orElseThrow(() -> new RuntimeException("학생 없음"));
                return ResponseEntity.ok(examService.getStudentExams(student).stream()
                                .map(StudentExamDto::fromEntity)
                                .toList());
        }

        @PreAuthorize("hasRole('STUDENT')")
        @GetMapping("/student/exam/{examId}")
        public ResponseEntity<StudentExamDto> getExamDetail(@PathVariable Long examId) {
                return ResponseEntity.ok(StudentExamDto.fromEntity(examService.getExam(examId)));
        }

        @PreAuthorize("hasRole('STUDENT')")
        @PostMapping("/student/exam/{examId}/submit")
        public ResponseEntity<String> submitExam(
                        @PathVariable Long examId,
                        @RequestBody Integer score,
                        Principal principal) {

                Users student = usersRepository.findByLoginId(principal.getName())
                                .orElseThrow(() -> new RuntimeException("학생 없음"));
                Exam exam = examService.getExam(examId);

                boolean passed = score >= exam.getPassScore();
                examService.recordAttempt(exam, student, score, passed);

                return ResponseEntity.ok("시험 제출 완료. 결과: " + (passed ? "통과" : "과락"));
        }

        @PreAuthorize("hasRole('STUDENT')")
        @GetMapping("/student/exam/{examId}/result")
        public ResponseEntity<List<ExamAttemptDto>> getExamResult(
                        @PathVariable Long examId,
                        Principal principal) {

                Users student = usersRepository.findByLoginId(principal.getName())
                                .orElseThrow(() -> new RuntimeException("학생 없음"));

                List<ExamAttempt> attempts = examService.getAttemptsByExamAndUser(examId, student);
                return ResponseEntity.ok(attempts.stream()
                                .map(ExamAttemptDto::fromEntity)
                                .toList());
        }

        // [수강생] 내 성적 보기
        @PreAuthorize("hasRole('STUDENT')")
        @GetMapping("/student/my-scores")
        public ResponseEntity<List<ScoreHistoryDto>> getMyScores(Principal principal) {
                Users student = usersRepository.findByLoginId(principal.getName()).orElseThrow();
                return ResponseEntity.ok(examService.getMyScores(student).stream()
                                .map(ScoreHistoryDto::fromEntity).toList());
        }
        // ==========================================
        // 🟨 강사 영역
        // ==========================================

        /** 강사 : 내 시험 목록 조회 (강사 본인이 출제한 모든 시험) */
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/instructor/exam")
        public ResponseEntity<List<InstructorExamDto>> listInstructorExams(Principal principal) {
                Users instructor = usersRepository.findByLoginId(principal.getName())
                                .orElseThrow(() -> new RuntimeException("강사 없음"));
                return ResponseEntity.ok(examService.getExamsByInstructor(instructor).stream()
                                .map(InstructorExamDto::fromEntity)
                                .toList());
        }

        /** 강사 : 시험 생성 */
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @PostMapping("/instructor/exam/new")
        public ResponseEntity<String> createExam(@RequestBody @Valid ExamCreateRequest form, Principal principal) {
                Users instructor = usersRepository.findByLoginId(principal.getName())
                                .orElseThrow(() -> new RuntimeException("강사 없음"));

                examService.createExam(
                                form.getCourseId(),
                                form.getTitle(),
                                form.getTimeLimit(),
                                form.getLevel(),
                                form.getPassScore(),
                                form.getIsPublished(),
                                instructor);
                return ResponseEntity.ok("시험 등록 성공");
        }

        /** 강사 : 시험 수정 */
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @PutMapping("/instructor/exam/{examId}")
        public ResponseEntity<String> updateExam(@PathVariable Long examId,
                        @RequestBody @Valid ExamCreateRequest form) {
                examService.updateExam(examId, form);
                return ResponseEntity.ok("시험 수정 성공");
        }

        /** 강사 : 시험 삭제 */
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @DeleteMapping("/instructor/exam/{examId}")
        public ResponseEntity<String> deleteExam(@PathVariable Long examId) {
                examService.deleteExam(examId);
                return ResponseEntity.ok("시험 삭제 성공");
        }

        /** 강사 : 시험 상세 조회 */
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/instructor/exam/{id}")
        public ResponseEntity<InstructorExamDto> getInstructorExam(@PathVariable Long id) {
                return ResponseEntity.ok(InstructorExamDto.fromEntity(examService.getExam(id)));
        }

        /** 강사 : 특정 강좌에 연결된 시험 목록 조회 (수정됨) */
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/instructor/course/{courseId}/exam")
        public ResponseEntity<List<InstructorExamDto>> listExamsByCourse(@PathVariable Long courseId) {
                // 수정: getExamsByInstructor 대신 getExamsByCourse 사용
                return ResponseEntity.ok(examService.getExamsByCourse(courseId).stream()
                                .map(InstructorExamDto::fromEntity)
                                .toList());
        }

        /** 강사 : 학생 응시 결과 조회 */
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/instructor/exam/{examId}/attempts")
        public ResponseEntity<List<ExamAttemptDto>> listExamAttempts(@PathVariable Long examId) {
                return ResponseEntity.ok(examService.getAttemptsByExam(examId).stream()
                                .map(ExamAttemptDto::fromEntity)
                                .toList());
        }

        // [강사] 특정 시험의 모든 응시 기록 조회
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/instructor/exam/{examId}/scores")
        public ResponseEntity<List<ScoreHistoryDto>> getExamScoresForInstructor(@PathVariable Long examId) {
                return ResponseEntity.ok(examService.getExamScoresForInstructor(examId).stream()
                                .map(ScoreHistoryDto::fromEntity)
                                .toList());
        }

        // ==========================================
        // 🟥 관리자 영역
        // ==========================================

        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/admin/logs/exams")
        public ResponseEntity<List<ExamAttemptDto>> getExamLogs() {
                return ResponseEntity.ok(examService.getAllAttempts().stream()
                                .map(ExamAttemptDto::fromEntity)
                                .toList());
        }

        // [관리자] 전체 성적 로그 보기
        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/admin/scores/all")
        public ResponseEntity<List<ScoreHistoryDto>> getAllScores() {
                return ResponseEntity.ok(examService.getAllScores().stream()
                                .map(ScoreHistoryDto::fromEntity)
                                .toList());
        }
}