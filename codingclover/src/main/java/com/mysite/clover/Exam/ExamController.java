package com.mysite.clover.Exam;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.mysite.clover.Exam.dto.ExamCreateRequest;
import com.mysite.clover.Exam.dto.InstructorExamDto;
import com.mysite.clover.Exam.dto.StudentExamDto;
import com.mysite.clover.ExamAttempt.ExamAttempt;
import com.mysite.clover.ExamAttempt.dto.ExamAttemptDto;
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

        /**
         * 시험 목록 조회 (수강생용)
         * 수강 중인 강좌 중, 응시 자격(진도율 80% 이상)이 충족된 시험 목록을 조회합니다.
         * 
         * @param principal 인증된 사용자 정보
         * @return 응시 가능한 시험 목록 (StudentExamDto)
         */
        @PreAuthorize("hasRole('STUDENT')")
        @GetMapping("/student/exam")
        public ResponseEntity<List<StudentExamDto>> listStudentExams(Principal principal) {
                Users student = usersRepository.findByLoginId(principal.getName())
                                .orElseThrow(() -> new RuntimeException("학생 없음"));
                return ResponseEntity.ok(examService.getStudentExams(student).stream()
                                .map(StudentExamDto::fromEntity)
                                .toList());
        }

        /**
         * 시험 상세 조회 (수강생용)
         * 시험 응시를 위한 상세 정보를 조회합니다.
         * 
         * @param examId 시험 ID
         * @return 시험 상세 정보
         */
        @PreAuthorize("hasRole('STUDENT')")
        @GetMapping("/student/exam/{examId}")
        public ResponseEntity<StudentExamDto> getExamDetail(@PathVariable Long examId) {
                return ResponseEntity.ok(StudentExamDto.fromEntity(examService.getExam(examId)));
        }

        /**
         * 시험 답안 제출
         * 응시자가 답안을 제출하고 채점을 수행합니다.
         * 
         * @param examId    시험 ID
         * @param score     획득 점수 (임시: 클라이언트 전송)
         * @param principal 인증된 사용자 정보
         * @return 시험 결과(통과 여부) 메시지
         */
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

        /**
         * 개인 시험 결과 조회
         * 특정 시험에 대한 본인의 응시 기록을 조회합니다.
         * 
         * @param examId    시험 ID
         * @param principal 인증된 사용자 정보
         * @return 응시 기록 목록
         */
        @PreAuthorize("hasRole('STUDENT')")
        @GetMapping("/student/exam/{examId}/result")
        public ResponseEntity<List<ExamAttemptDto>> getExamResult(
                        @PathVariable Long examId,
                        Principal principal) {

                Users student = usersRepository.findByLoginId(principal.getName())
                                .orElseThrow(() -> new RuntimeException("학생 없음"));

                List<ExamAttempt> attempts = examService.getAttemptsByExamAndUser(examId, student);
                List<ExamAttemptDto> dtos = attempts.stream()
                                .map(ExamAttemptDto::fromEntity)
                                .collect(Collectors.toList());

                return ResponseEntity.ok(dtos);
        }

        // ==========================================
        // 🟨 강사 영역
        // ==========================================

        /**
         * 강사 : 시험 관리 (내 시험 목록)
         * 본인이 출제한 모든 시험 목록을 조회합니다.
         * 
         * @param principal 인증된 사용자 정보
         * @return 시험 목록 (InstructorExamDto)
         */
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/instructor/exam")
        public ResponseEntity<List<InstructorExamDto>> listInstructorExams(Principal principal) {
                Users instructor = usersRepository.findByLoginId(principal.getName())
                                .orElseThrow(() -> new RuntimeException("강사 없음"));
                return ResponseEntity.ok(examService.getExamsByInstructor(instructor).stream()
                                .map(InstructorExamDto::fromEntity)
                                .toList());
        }

        /**
         * 강사 : 시험 등록
         * 새로운 시험을 생성합니다. 강좌, 제한 시간, 합격 기준 등을 설정합니다.
         * 
         * @param form      시험 생성 요청 데이터
         * @param principal 인증된 사용자 정보
         * @return 등록 결과 메시지
         */
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @PostMapping("/instructor/exam/new")
        public ResponseEntity<String> createExam(
                        @RequestBody @Valid ExamCreateRequest form,
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

        /**
         * 강사 : 시험 상세 조회
         * 본인이 출제한 시험의 상세 정보를 조회합니다.
         * 
         * @param id 시험 ID
         * @return 시험 상세 정보
         */
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/instructor/exam/{id}")
        public ResponseEntity<InstructorExamDto> getInstructorExam(@PathVariable Long id) {
                return ResponseEntity.ok(InstructorExamDto.fromEntity(examService.getExam(id)));
        }

        /**
         * 강사 : 강좌별 시험 목록 조회
         * 특정 강좌에 연결된 시험 목록을 조회합니다.
         * 
         * @param courseId 강좌 ID
         * @return 시험 목록
         */
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/instructor/course/{courseId}/exam")
        public ResponseEntity<List<InstructorExamDto>> listExamsByCourse(@PathVariable Long courseId) {
                return ResponseEntity.ok(examService.getExamsByCourse(courseId).stream()
                                .map(InstructorExamDto::fromEntity)
                                .toList());
        }

        /**
         * 강사 : 시험 응시 결과 조회
         * 특정 시험에 대한 학생들의 응시 기록을 조회합니다.
         * 
         * @param examId 시험 ID
         * @return 응시 기록 목록
         */
        @PreAuthorize("hasRole('INSTRUCTOR')")
        @GetMapping("/instructor/course/{courseId}/exam/{examId}/attempts")
        public ResponseEntity<List<ExamAttemptDto>> listExamAttempts(
                        @PathVariable Long examId) {
                List<ExamAttempt> attempts = examService.getAttemptsByExam(examId);
                List<ExamAttemptDto> dtos = attempts.stream()
                                .map(ExamAttemptDto::fromEntity)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(dtos);
        }

        // ==========================================
        // 🟥 관리자 영역
        // ==========================================

        /**
         * 관리자 : 전체 시험 로그 조회
         * 시스템 상의 모든 시험 응시 기록을 조회합니다.
         * 
         * @return 전체 응시 기록 목록
         */
        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/admin/logs/exams")
        public ResponseEntity<List<ExamAttemptDto>> getExamLogs() {
                List<ExamAttempt> attempts = examService.getAllAttempts();
                List<ExamAttemptDto> dtos = attempts.stream()
                                .map(ExamAttemptDto::fromEntity)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(dtos);
        }
}
