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
import com.mysite.clover.Lecture.LectureApprovalStatus;
import com.mysite.clover.LectureProgress.LectureProgressRepository;
import com.mysite.clover.ScoreHistory.ScoreHistory;
import com.mysite.clover.ScoreHistory.ScoreHistoryRepository;

/**
 * 시험 서비스
 * 시험 출제, 응시, 결과 처리 등 시험과 관련된 핵심 비즈니스 로직을 담당합니다.
 * 수강생의 진도율을 체크하여 시험 응시 자격을 부여하는 로직도 포함되어 있습니다.
 */
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

    // 시험 단건 조회
    public Exam getExam(Long examId) {
        // 시험 ID로 시험 조회
        return examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("시험을 찾을 수 없습니다."));
    }

    // 시험 생성
    @Transactional
    public void createExam(Long courseId, String title, Integer timeLimit, Integer level, Integer passScore,
            Boolean isPublished, Users instructor) {
        // 강좌 ID로 강좌 조회
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("강좌를 찾을 수 없습니다."));

        // 시험 생성
        Exam exam = new Exam();
        // 강좌 설정
        exam.setCourse(course);
        // 제목 설정
        exam.setTitle(title);
        // 시간 제한 설정
        exam.setTimeLimit(timeLimit);
        // 난이도 설정
        exam.setLevel(level);
        // 합격 점수 설정
        exam.setPassScore(passScore);
        // 공개 여부 설정
        exam.setIsPublished(isPublished);
        // 생성자 설정
        exam.setCreatedBy(instructor);

        // 시험 저장
        examRepository.save(exam);
    }

    /**
     * 시험 응시 기록 저장
     * ScoreHistory(명세서 테이블)와 ExamAttempt(기존 테이블)를 동시에 저장합니다.
     */
    @Transactional
    public void recordAttempt(Exam exam, Users user, Integer score, Boolean passed) {
        // 중복 제거 후 통합된 로직
        Integer attemptNo = scoreHistoryRepository.findByUserAndExamOrderByAttemptNoDesc(user, exam)
                .stream().findFirst().map(ScoreHistory::getAttemptNo).orElse(0) + 1;

        ScoreHistory history = new ScoreHistory();
        history.setExam(exam);
        history.setUser(user);
        history.setScore(score);
        history.setAttemptNo(attemptNo);
        history.setPassed(passed);
        history.setCreatedAt(LocalDateTime.now());
        scoreHistoryRepository.save(history);
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
            long totalLectures = lectureRepository.countByCourseAndApprovalStatus(course,
                    LectureApprovalStatus.APPROVED);
            if (totalLectures == 0)
                continue;

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