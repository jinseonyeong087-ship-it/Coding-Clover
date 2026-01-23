package com.mysite.clover.Exam;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseRepository;
import com.mysite.clover.Users.Users;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.mysite.clover.Enrollment.Enrollment;
import com.mysite.clover.Enrollment.EnrollmentRepository;
import com.mysite.clover.Enrollment.EnrollmentStatus;
import com.mysite.clover.Exam.dto.ExamCreateRequest;
import com.mysite.clover.ExamAttempt.ExamAttempt;
import com.mysite.clover.ExamAttempt.ExamAttemptRepository;
import com.mysite.clover.Lecture.LectureRepository;
import com.mysite.clover.LectureProgress.LectureProgressRepository;
import com.mysite.clover.ScoreHistory.ScoreHistory;
import com.mysite.clover.ScoreHistory.ScoreHistoryRepository;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LectureRepository lectureRepository;
    private final LectureProgressRepository lectureProgressRepository;
    private final ScoreHistoryRepository scoreHistoryRepository;

    public Exam getExam(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("시험을 찾을 수 없습니다."));
    }

    /** 시험 생성 */
    @Transactional
    public void createExam(Long courseId, String title, Integer timeLimit, Integer level, Integer passScore,
                           Boolean isPublished, Users instructor) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("강좌를 찾을 수 없습니다."));

        Exam exam = new Exam();
        exam.setCourse(course);
        exam.setTitle(title);
        exam.setTimeLimit(timeLimit);
        exam.setLevel(level);
        exam.setPassScore(passScore);
        exam.setIsPublished(isPublished); 
        exam.setCreatedBy(instructor);

        examRepository.save(exam);
    }

    /** * 시험 응시 기록 저장 
     * ScoreHistory(명세서 테이블)와 ExamAttempt(기존 테이블)를 동시에 저장합니다.
     */
    @Transactional
    public void recordAttempt(Exam exam, Users user, Integer score, Boolean passed) {
        // 1. 기존 시도 횟수 조회 (ScoreHistory 테이블 기준)
        Integer attemptNo = scoreHistoryRepository.findByUserAndExamOrderByAttemptNoDesc(user, exam)
                .stream()
                .findFirst()
                .map(ScoreHistory::getAttemptNo)
                .orElse(0) + 1;

        // 2. ScoreHistory 저장 (명세서 기반)
        ScoreHistory history = new ScoreHistory();
        history.setExam(exam);
        history.setUser(user);
        history.setScore(score);
        history.setAttemptNo(attemptNo);
        history.setPassed(passed); // ScoreHistory 엔티티의 필드명이 passed인지 확인하세요
        history.setCreatedAt(LocalDateTime.now());
        scoreHistoryRepository.save(history);

        // 3. ExamAttempt 저장 (기존 로직 유지)
        ExamAttempt attempt = new ExamAttempt();
        attempt.setExam(exam);
        attempt.setUser(user);
        attempt.setAttemptNo(attemptNo);
        attempt.setScore(score);
        attempt.setPassed(passed);
        attempt.setAttemptedAt(LocalDateTime.now());
        examAttemptRepository.save(attempt);
    }

    /** 시험 수정 */
    @Transactional
    public void updateExam(Long examId, ExamCreateRequest form) {
        Exam exam = getExam(examId);
        exam.setTitle(form.getTitle());
        exam.setTimeLimit(form.getTimeLimit());
        exam.setLevel(form.getLevel());
        exam.setPassScore(form.getPassScore());
        exam.setIsPublished(form.getIsPublished());
        examRepository.save(exam);
    }

    /** 시험 삭제 */
    @Transactional
    public void deleteExam(Long examId) {
        Exam exam = getExam(examId);
        examRepository.delete(exam);
    }

    /** 수강생용 응시 가능 시험 조회 */
    public List<Exam> getStudentExams(Users student) {
        List<Exam> availableExams = new ArrayList<>();
        List<Enrollment> enrollments = enrollmentRepository.findByUser(student).stream()
                .filter(e -> e.getStatus() != EnrollmentStatus.CANCELLED)
                .toList();

        for (Enrollment enrollment : enrollments) {
            Course course = enrollment.getCourse();
            long totalLectures = lectureRepository.countByCourseAndApprovalStatus(course, "APPROVED");
            if (totalLectures == 0) continue;

            long completedLectures = lectureProgressRepository.findByEnrollmentAndCompletedYnTrue(enrollment).size();
            double progress = (double) completedLectures / totalLectures;

            if (progress >= 0.8) {
                availableExams.addAll(examRepository.findByCourseAndIsPublishedTrue(course));
            }
        }
        return availableExams;
    }

    public List<Exam> getExamsByInstructor(Users instructor) {
        return examRepository.findByCreatedBy(instructor);
    }

    // 강좌 ID로 시험 목록 조회 (컨트롤러 listExamsByCourse에서 사용)
    public List<Exam> getExamsByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("강좌를 찾을 수 없습니다."));
        return examRepository.findByCourse(course);
    }

    public List<ExamAttempt> getAttemptsByExam(Long examId) {
        return examAttemptRepository.findByExam(getExam(examId));
    }

    public List<ExamAttempt> getAttemptsByExamAndUser(Long examId, Users user) {
        return examAttemptRepository.findByExamAndUser(getExam(examId), user);
    }

    public List<ExamAttempt> getAllAttempts() {
        return examAttemptRepository.findAll();
    }
    // 수강생용: 본인 성적 조회
public List<ScoreHistory> getMyScores(Users student) {
    return scoreHistoryRepository.findByUserOrderByCreatedAtDesc(student);
}

// 강사용: 특정 시험 응시 결과 조회
public List<ScoreHistory> getExamScoresForInstructor(Long examId) {
    Exam exam = getExam(examId);
    return scoreHistoryRepository.findByExamOrderByCreatedAtDesc(exam);
}

// 관리자용: 시스템 전체 성적 로그 조회
public List<ScoreHistory> getAllScores() {
    return scoreHistoryRepository.findAll();
}
}