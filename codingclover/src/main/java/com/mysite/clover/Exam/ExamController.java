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

@RequiredArgsConstructor
@RestController
public class ExamController {

        private final ExamService examService;
        private final UsersRepository usersRepository;

        // ==========================================
        // 🟩 수강생 영역
        // ==========================================

        // 수강생이 응시 가능한 시험 목록 조회 (진도율 체크 포함)
        @PreAuthorize("hasRole('STUDENT')")
        @GetMapping("/student/exam")
        public ResponseEntity<List<StudentExamDto>> listStudentExams(Principal principal) {
                // 1. 현재 로그인한 학생 정보 조회
                Users student = usersRepository.findByLoginId(principal.getName())
                                .orElseThrow(() -> new RuntimeException("학생 없음"));

                // 2. 응시 자격이 있는 시험 목록을 서비스에서 조회 후 DTO로 변환
                return ResponseEntity.ok(examService.getStudentExams(student).stream()
                                .map(StudentExamDto::fromEntity)
                                .toList());
        }

        // 수강생 : 시험 상세 조회 (응시 화면 진입용)
        @PreAuthorize("hasRole('STUDENT')")
        @GetMapping("/student/exam/{examId}")
        public ResponseEntity<StudentExamDto> getExamDetail(@PathVariable Long examId) {
                // 시험 ID로 상세 정보 조회 및 DTO 변환
                return ResponseEntity.ok(StudentExamDto.fromEntity(examService.getExam(examId)));
        }

        // 수강생 : 시험 답안 제출 및 채점
        @PreAuthorize("hasRole('STUDENT')")
        @PostMapping("/student/exam/{examId}/submit")
        public ResponseEntity<String> submitExam(
                        @PathVariable Long examId,
                        @RequestBody Integer score, // 프론트엔드에서 계산된 점수 (또는 서버에서 계산 가능)
                        Principal principal) {

                // 1. 응시자(학생) 조회
                Users student = usersRepository.findByLoginId(principal.getName())
                                .orElseThrow(() -> new RuntimeException("학생 없음"));
                // 2. 시험 정보 조회
                Exam exam = examService.getExam(examId);

                // 3. 합격 여부 판단 (제출 점수 >= 합격 기준 점수)
                boolean passed = score >= exam.getPassScore();

                // 4. 응시 기록 저장 (서비스 호출)
                examService.recordAttempt(exam, student, score, passed);

                // 5. 결과 반환
                return ResponseEntity.ok("시험 제출 완료. 결과: " + (passed ? "통과" : "과락"));
        }

        // 수강생 : 특정 시험에 대한 나의 과거 응시 기록 조회
        @PreAuthorize("hasRole('STUDENT')")
        @GetMapping("/student/exam/{examId}/result")
        public ResponseEntity<List<ExamAttemptDto>> getExamResult(
                        @PathVariable Long examId,
                        Principal principal) {

                // 1. 응시자 조회
                Users student = usersRepository.findByLoginId(principal.getName())
                                .orElseThrow(() -> new RuntimeException("학생 없음"));

                // 2. 해당 시험에 대한 학생의 응시 기록 목록 조회
                List<ExamAttempt> attempts = examService.getAttemptsByExamAndUser(examId, student);

                // 3. DTO 리스트로 변환 반환
                return ResponseEntity.ok(attempts.stream()
                                .map(ExamAttemptDto::fromEntity)
                                .toList());
        }

        // [수강생] 내 모든 성적 조회 (모든 시험 통합)
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

        // 강사 : 내 시험 목록 조회 (강사 본인이 출제한 모든 시험)
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/instructor/exam")
        public ResponseEntity<List<InstructorExamDto>> listInstructorExams(Principal principal) {
                // 1. 강사 정보 조회
                Users instructor = usersRepository.findByLoginId(principal.getName())
                                .orElseThrow(() -> new RuntimeException("강사 없음"));

                // 2. 강사가 만든 시험 목록 조회 후 DTO 변환
                return ResponseEntity.ok(examService.getExamsByInstructor(instructor).stream()
                                .map(InstructorExamDto::fromEntity)
                                .toList());
        }

        // 강사 : 신규 시험 생성
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @PostMapping("/instructor/exam/new")
        public ResponseEntity<String> createExam(@RequestBody @Valid ExamCreateRequest form, Principal principal) {
                // 1. 강사 정보 조회
                Users instructor = usersRepository.findByLoginId(principal.getName())
                                .orElseThrow(() -> new RuntimeException("강사 없음"));

                // 2. 시험 생성 서비스 호출
                examService.createExam(
                                form.getCourseId(),
                                form.getTitle(),
                                form.getTimeLimit(),
                                form.getLevel(),
                                form.getPassScore(),
                                form.getIsPublished(),
                                instructor);

                // 3. 응답
                return ResponseEntity.ok("시험 등록 성공");
        }

        // 강사 : 시험 정보 수정
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @PutMapping("/instructor/exam/{examId}")
        public ResponseEntity<String> updateExam(@PathVariable Long examId,
                        @RequestBody @Valid ExamCreateRequest form) {
                // 수정 서비스 호출
                examService.updateExam(examId, form);
                return ResponseEntity.ok("시험 수정 성공");
        }

        // 강사 : 시험 삭제
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @DeleteMapping("/instructor/exam/{examId}")
        public ResponseEntity<String> deleteExam(@PathVariable Long examId) {
                // 삭제 서비스 호출
                examService.deleteExam(examId);
                return ResponseEntity.ok("시험 삭제 성공");
        }

        // 강사 : 시험 상세 조회 (수정 화면 등에서 사용)
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/instructor/exam/{id}")
        public ResponseEntity<InstructorExamDto> getInstructorExam(@PathVariable Long id) {
                return ResponseEntity.ok(InstructorExamDto.fromEntity(examService.getExam(id)));
        }

        // 강사 : 특정 강좌에 연결된 시험 목록 조회
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/instructor/course/{courseId}/exam")
        public ResponseEntity<List<InstructorExamDto>> listExamsByCourse(@PathVariable Long courseId) {
                // 강좌별 시험 목록 조회 서비스 호출
                return ResponseEntity.ok(examService.getExamsByCourse(courseId).stream()
                                .map(InstructorExamDto::fromEntity)
                                .toList());
        }

        // 강사 : 특정 시험에 대한 학생들의 응시 이력(ExamAttempt) 조회
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/instructor/exam/{examId}/attempts")
        public ResponseEntity<List<ExamAttemptDto>> listExamAttempts(@PathVariable Long examId) {
                return ResponseEntity.ok(examService.getAttemptsByExam(examId).stream()
                                .map(ExamAttemptDto::fromEntity)
                                .toList());
        }

        // [강사] 특정 시험의 모든 응시 기록(ScoreHistory) 조회
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

        // 관리자 : 시스템 전체 시험 응시 로그 조회 (ExamAttempt 기준)
        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/admin/logs/exams")
        public ResponseEntity<List<ExamAttemptDto>> getExamLogs() {
                return ResponseEntity.ok(examService.getAllAttempts().stream()
                                .map(ExamAttemptDto::fromEntity)
                                .toList());
        }

        // [관리자] 전체 성적 로그 보기 (ScoreHistory 기준)
        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/admin/scores/all")
        public ResponseEntity<List<ScoreHistoryDto>> getAllScores() {
                return ResponseEntity.ok(examService.getAllScores().stream()
                                .map(ScoreHistoryDto::fromEntity)
                                .toList());
        }
}
