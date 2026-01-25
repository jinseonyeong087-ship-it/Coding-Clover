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

    // 시험 단건 조회 (ID로 조회, 없으면 예외 발생)
    public Exam getExam(Long examId) {
        // 시험 ID로 시험 조회
        return examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("시험을 찾을 수 없습니다."));
    }

    // 신규 시험 생성 (강사가 강좌에 시험을 추가)
    @Transactional
    public void createExam(Long courseId, String title, Integer timeLimit, Integer level, Integer passScore,
            Boolean isPublished, Users instructor) {
        // 1. 강좌 ID로 강좌 정보를 조회
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("강좌를 찾을 수 없습니다."));

        // 2. 새로운 시험 엔티티 생성
        Exam exam = new Exam();

        // 3. 필드 값 설정
        exam.setCourse(course); // 소속 강좌
        exam.setTitle(title); // 시험 제목
        exam.setTimeLimit(timeLimit); // 제한 시간
        exam.setLevel(level); // 난이도
        exam.setPassScore(passScore); // 합격 기준 점수
        exam.setIsPublished(isPublished); // 공개 여부
        exam.setCreatedBy(instructor); // 출제 강사

        // 4. DB에 저장
        examRepository.save(exam);
    }

    // 시험 응시 결과 기록 (ScoreHistory 및 ExamAttempt에 저장)
    // ScoreHistory(명세서 테이블)와 ExamAttempt(기존 테이블)를 동시에 저장합니다.
    @Transactional
    public void recordAttempt(Exam exam, Users user, Integer score, Boolean passed) {
        // 1. 현재 사용자의 해당 시험 시도 횟수 계산 (기존 기록 중 가장 높은 시도 횟수 + 1)
        Integer attemptNo = scoreHistoryRepository.findByUserAndExamOrderByAttemptNoDesc(user, exam)
                .stream().findFirst().map(ScoreHistory::getAttemptNo).orElse(0) + 1;

        // 2. ScoreHistory 엔티티 생성 및 저장 (성적 이력 관리)
        ScoreHistory history = new ScoreHistory();
        history.setExam(exam);
        history.setUser(user);
        history.setScore(score);
        history.setAttemptNo(attemptNo);
        history.setPassed(passed);
        history.setCreatedAt(LocalDateTime.now());
        scoreHistoryRepository.save(history);

        // 3. ExamAttempt 엔티티 생성 및 저장 (응시 상세 기록)
        ExamAttempt attempt = new ExamAttempt();
        attempt.setExam(exam);
        attempt.setUser(user);
        attempt.setScore(score);
        attempt.setAttemptNo(attemptNo);
        attempt.setPassed(passed);
        // attemptedAt은 @CreatedDate에 의해 자동 설정되거나 명시적 설정 필요 (여기선 엔티티 설정 따름)
        // 만약 자동 설정이 안된다면 attempt.setAttemptedAt(LocalDateTime.now()) 필요

        examAttemptRepository.save(attempt);
    }

    // 시험 정보 수정 (제목, 시간제한, 난이도 등)
    @Transactional
    public void updateExam(Long examId, ExamCreateRequest form) {
        // 1. 수정할 시험 조회
        Exam exam = getExam(examId);

        // 2. 필드 값 업데이트
        exam.setTitle(form.getTitle());
        exam.setTimeLimit(form.getTimeLimit());
        exam.setLevel(form.getLevel());
        exam.setPassScore(form.getPassScore());
        exam.setIsPublished(form.getIsPublished());

        // 3. 저장 (Dirty Checking으로 자동 반영 가능하지만 명시적 save 호출)
        examRepository.save(exam);
    }

    // 시험 삭제
    @Transactional
    public void deleteExam(Long examId) {
        // 1. 삭제할 시험 조회
        Exam exam = getExam(examId);
        // 2. DB에서 삭제
        examRepository.delete(exam);
    }

    // 수강생이 응시 가능한 시험 목록 조회 (수강 진도율 80% 이상 조건)
    public List<Exam> getStudentExams(Users student) {
        List<Exam> availableExams = new ArrayList<>();

        // 1. 학생이 수강 중인(취소되지 않은) Enrollment 목록 조회
        List<Enrollment> enrollments = enrollmentRepository.findByUser(student).stream()
                .filter(e -> e.getStatus() != EnrollmentStatus.CANCELLED)
                .toList();

        for (Enrollment enrollment : enrollments) {
            Course course = enrollment.getCourse();

            // 2. 해당 강좌의 승인된 전체 강의 수 조회
            long totalLectures = lectureRepository.countByCourseAndApprovalStatus(course,
                    LectureApprovalStatus.APPROVED);

            // 강의가 하나도 없으면 건너뜀
            if (totalLectures == 0)
                continue;

            // 3. 학생이 완료한 강의 수 조회 (진도율 체크)
            long completedLectures = lectureProgressRepository.findByEnrollmentAndCompletedYnTrue(enrollment).size();
            double progress = (double) completedLectures / totalLectures;

            // 4. 진도율이 80% 이상인 경우에만 해당 강좌의 공개된 시험 목록을 추가
            if (progress >= 0.8) {
                availableExams.addAll(examRepository.findByCourseAndIsPublishedTrue(course));
            }
        }
        return availableExams;
    }

    // 특정 강사가 출제한 모든 시험 목록 조회
    public List<Exam> getExamsByInstructor(Users instructor) {
        return examRepository.findByCreatedBy(instructor);
    }

    // 특정 강좌에 포함된 시험 목록 조회 (강좌 상세 페이지 등에서 사용)
    public List<Exam> getExamsByCourse(Long courseId) {
        // 강좌 조회 확인
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("강좌를 찾을 수 없습니다."));
        return examRepository.findByCourse(course);
    }

    // 특정 시험에 대한 모든 응시 기록 조회 (강사용)
    public List<ExamAttempt> getAttemptsByExam(Long examId) {
        return examAttemptRepository.findByExam(getExam(examId));
    }

    // 특정 사용자가 특정 시험에 응시한 기록 조회 (수강생용)
    public List<ExamAttempt> getAttemptsByExamAndUser(Long examId, Users user) {
        return examAttemptRepository.findByExamAndUser(getExam(examId), user);
    }

    // 시스템 전체 응시 기록 조회 (관리자용)
    public List<ExamAttempt> getAllAttempts() {
        return examAttemptRepository.findAll();
    }

    // 수강생용: 본인의 모든 성적 이력 조회
    public List<ScoreHistory> getMyScores(Users student) {
        return scoreHistoryRepository.findByUserOrderByCreatedAtDesc(student);
    }

    // 강사용: 특정 시험의 성적 이력 조회 (누가 언제 몇 점 받았는지)
    public List<ScoreHistory> getExamScoresForInstructor(Long examId) {
        Exam exam = getExam(examId);
        return scoreHistoryRepository.findByExamOrderByCreatedAtDesc(exam);
    }

    // 관리자용: 시스템 전체 성적 로그 조회
    public List<ScoreHistory> getAllScores() {
        return scoreHistoryRepository.findAll();
    }
}
