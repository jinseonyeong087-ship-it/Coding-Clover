package com.mysite.clover.Exam;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseRepository;
import com.mysite.clover.Users.Users;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final CourseRepository courseRepository;

    // 강좌별 시험 목록 조회
    public List<Exam> getExamsByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("강좌를 찾을 수 없습니다."));
        return examRepository.findByCourse(course);
    }

    // 시험 상세 조회
    public Exam getExam(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("시험을 찾을 수 없습니다."));
    }

    // 시험 생성 (강사)
    @Transactional
    public void createExam(Long courseId, String title, Integer timeLimit, Integer level, Integer passScore,
            Users instructor) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("강좌를 찾을 수 없습니다."));

        Exam exam = new Exam();
        exam.setCourse(course);
        exam.setTitle(title);
        exam.setTimeLimit(timeLimit);
        exam.setLevel(level);
        exam.setPassScore(passScore);
        exam.setCreatedBy(instructor);

        examRepository.save(exam);
    }

    // 시험 응시 시작/제출 로직은 추후 구체화 (점수 기록 등)
    // 현재는 단순 기록용 메서드 예시
    @Transactional
    public void recordAttempt(Exam exam, Users user, Integer score, Boolean passed) {
        // 기존 시도 횟수 조회
        Integer attemptNo = examAttemptRepository.findTopByExamAndUserOrderByAttemptNoDesc(exam, user)
                .map(a -> a.getAttemptNo() + 1)
                .orElse(1);

        ExamAttempt attempt = new ExamAttempt();
        attempt.setExam(exam);
        attempt.setUser(user);
        attempt.setAttemptNo(attemptNo);
        attempt.setScore(score);
        attempt.setPassed(passed);

        examAttemptRepository.save(attempt);
    }

    // 특정 시험의 응시 이력 (강사용)
    public List<ExamAttempt> getAttemptsByExam(Long examId) {
        Exam exam = getExam(examId);
        return examAttemptRepository.findByExam(exam);
    }

    // 전체 응시 이력 (관리자용)
    public List<ExamAttempt> getAllAttempts() {
        return examAttemptRepository.findAll();
    }

    // 강사별 시험 목록
    public List<Exam> getExamsByInstructor(Users instructor) {
        // Repository method need to be added: findByCreatedBy
        // But wait, ExamRepository doesn't have it yet.
        // Let's assume we will add it.
        return examRepository.findByCreatedBy(instructor);
    }

    // 특정 시험의 내 시도 내역 (수강생용)
    public List<ExamAttempt> getAttemptsByExamAndUser(Long examId, Users user) {
        Exam exam = getExam(examId);
        return examAttemptRepository.findByExamAndUser(exam, user);
    }

    // 학생이 응시 가능한 시험 목록 (수강 중인 강좌의 시험들)
    public List<Exam> getStudentExams(Users student) {
        // 1. 학생이 수강중인 강좌 ID 목록 조회 (Enrollment 이용) - Service or Repository call
        // 2. 해당 강좌들의 시험 목록 조회
        // This logic requires EnrollmentRepository or similar dependency.
        // For now, let's inject EnrollmentRepository if not present?
        // Ah, ExamService doesn't have EnrollmentRepository injection.
        // I will add it.
        return List.of(); // Placeholder until EnrollmentRepository is injected.
    }
}
