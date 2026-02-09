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
import java.util.Map;

import com.mysite.clover.Enrollment.Enrollment;
import com.mysite.clover.Enrollment.EnrollmentRepository;
import com.mysite.clover.Enrollment.EnrollmentStatus;
import com.mysite.clover.Exam.dto.ExamCreateRequest;
import com.mysite.clover.Exam.dto.ExamResultDto;
import com.mysite.clover.ExamAttempt.ExamAttempt;
import com.mysite.clover.ExamAttempt.ExamAttemptRepository;
import com.mysite.clover.Lecture.LectureRepository;

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
@Transactional(readOnly = true)
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ExamAnswerRepository examAnswerRepository;
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
    public void createExam(ExamCreateRequest request, Users instructor) {
        // 1. 강좌 ID로 강좌 정보를 조회
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("강좌를 찾을 수 없습니다."));

        // 2. 이미 해당 강좌에 시험이 있는지 확인 (강좌별 1개 제한 정책)
        if (examRepository.findByCourse(course).size() > 0) {
            throw new IllegalArgumentException("이미 해당 강좌에 등록된 시험이 있습니다.");
        }

        // 3. 새로운 시험 엔티티 생성
        Exam exam = new Exam();
        exam.setCourse(course); // 소속 강좌
        exam.setTitle(request.getTitle()); // 시험 제목
        exam.setTimeLimit(request.getTimeLimit()); // 제한 시간
        exam.setLevel(request.getLevel()); // 난이도
        exam.setPassScore(request.getPassScore()); // 합격 기준 점수
        exam.setIsPublished(request.getIsPublished()); // 공개 여부
        exam.setCreatedBy(instructor); // 출제 강사

        // 4. 시험 저장 (ID 생성)
        Exam savedExam = examRepository.save(exam);

        // 5. 문제 저장
        if (request.getQuestions() != null) {
            for (com.mysite.clover.Exam.dto.ExamQuestionDto qDto : request.getQuestions()) {
                ExamQuestion question = new ExamQuestion();
                question.setExam(savedExam);
                question.setQuestionText(qDto.getQuestionText());
                question.setOption1(qDto.getOption1());
                question.setOption2(qDto.getOption2());
                question.setOption3(qDto.getOption3());
                question.setOption4(qDto.getOption4());
                question.setOption5(qDto.getOption5());
                question.setCorrectAnswer(qDto.getCorrectAnswer());
                examQuestionRepository.save(question);
            }
        }
    }

    // 시험 응시 및 채점 (핵심 로직 - 대체 메서드)
    @Transactional
    public ExamResultDto submitExam(Long examId, Users student, Map<Long, Integer> answers) {
        // 1. 시험 정보 조회
        Exam exam = getExam(examId);

        // 2. 전체 문제 조회
        List<ExamQuestion> questions = examQuestionRepository.findByExam(exam);
        int totalQuestions = questions.size();
        int correctCount = 0;

        // 3. ExamAttempt(응시 기록) 먼저 생성 (ID 생성을 위해 저장)
        // 시도 횟수 계산
        Integer attemptNo = scoreHistoryRepository.findByUserAndExamOrderByAttemptNoDesc(student, exam)
                .stream().findFirst().map(ScoreHistory::getAttemptNo).orElse(0) + 1;

        ExamAttempt attempt = new ExamAttempt();
        attempt.setExam(exam);
        attempt.setUser(student);
        attempt.setAttemptNo(attemptNo);
        // attempt.setAttemptedAt(LocalDateTime.now()); // Entity Listener 처리 가정
        attempt.setScore(0); // 임시 저장
        attempt.setPassed(false);
        attempt.setAttemptedAt(LocalDateTime.now());
        ExamAttempt savedAttempt = examAttemptRepository.save(attempt);

        // 4. 답안 확인 및 저장
        for (ExamQuestion q : questions) {
            Integer selectedOption = answers.get(q.getQuestionId());
            boolean isCorrect = false;

            if (selectedOption != null) {
                if (selectedOption.equals(q.getCorrectAnswer())) {
                    isCorrect = true;
                    correctCount++;
                }
            }

            // 답안 엔티티 저장
            ExamAnswer examAnswer = new ExamAnswer();
            examAnswer.setAttempt(savedAttempt);
            examAnswer.setQuestion(q);
            examAnswer.setSelectedAnswer(selectedOption);
            examAnswer.setIsCorrect(isCorrect);
            examAnswerRepository.save(examAnswer);
        }

        // 5. 점수 계산 (100점 만점 환산)
        int score = 0;
        if (totalQuestions > 0) {
            score = (int) (((double) correctCount / totalQuestions) * 100);
        }
        boolean passed = score >= exam.getPassScore();

        // 6. ExamAttempt 업데이트
        savedAttempt.setScore(score);
        savedAttempt.setPassed(passed);
        examAttemptRepository.save(savedAttempt);

        // 7. ScoreHistory 저장 (이력 관리용)
        ScoreHistory history = new ScoreHistory();
        history.setExam(exam);
        history.setUser(student);
        history.setScore(score);
        history.setAttemptNo(attemptNo);
        history.setPassed(passed);
        history.setCreatedAt(LocalDateTime.now());
        scoreHistoryRepository.save(history);

        // 8. 결과 반환
        String message = passed ? "축하합니다! 합격입니다." : "아쉽게도 불합격입니다.";
        return new ExamResultDto(score, passed, correctCount, totalQuestions, message);
    }

    // 구버전 메서드 (필요시 삭제)
    @Transactional
    public void recordAttempt(Exam exam, Users user, Integer score, Boolean passed) {
        // ... (deprecated)
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
        exam.setPassScore(form.getPassScore());
        // null 체크 및 기본값 설정
        exam.setIsPublished(form.getIsPublished() != null ? form.getIsPublished() : false);

        // 3. 저장 (Dirty Checking으로 자동 반영 가능하지만 명시적 save 호출)
        examRepository.save(exam);

        // 4. 문제 수정 로직
        // 주의: 이미 응시 기록(ExamAttempt)이 있는 경우, 문제를 수정하면 기존 답안(ExamAnswer)과의 관계가 깨지거나 데이터
        // 무결성 문제가 발생할 수 있음.
        // 따라서 응시 기록이 없는 경우에만 문제를 수정(삭제 후 재생성)하도록 함.
        boolean hasAttempts = examAttemptRepository.existsByExam(exam);

        if (!hasAttempts && form.getQuestions() != null) {
            // 4-1. 기존 문제 삭제 (OrphanRemoval 동작 유도)
            exam.getQuestions().clear();

            // 4-2. 새 문제 추가
            for (com.mysite.clover.Exam.dto.ExamQuestionDto qDto : form.getQuestions()) {
                ExamQuestion question = new ExamQuestion();
                question.setExam(exam); // 양방향 연관관계 설정
                question.setQuestionText(qDto.getQuestionText());
                question.setOption1(qDto.getOption1());
                question.setOption2(qDto.getOption2());
                question.setOption3(qDto.getOption3());
                question.setOption4(qDto.getOption4());
                question.setOption5(qDto.getOption5());
                question.setCorrectAnswer(qDto.getCorrectAnswer());

                // 컬렉션에 추가 (CascadeType.ALL로 인해 자동 저장됨)
                exam.getQuestions().add(question);
            }
            // 명시적 save 호출 (필수는 아니지만 확실한 반영을 위해)
            examRepository.save(exam);
        } else if (hasAttempts && form.getQuestions() != null) {
            // 응시 기록이 있는데 문제 수정 요청이 온 경우
            // 여기서는 조용히 무시하거나, 예외를 던질 수 있음.
            // 현재 정책: 기본 정보는 수정되지만, 문제는 수정되지 않음을 로그로 남김 (또는 사용자에게 알림 필요)
            System.out.println("Warning: Exam " + examId + " has attempts. Questions were not updated.");
            // 만약 사용자에게 확실히 알리고 싶다면 예외를 던져서 프론트엔드에서 처리하게 할 수도 있음:
            // throw new IllegalStateException("이미 응시 기록이 있어 문제는 수정할 수 없습니다.");
        }
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

            // 2. 해당 강좌의 승인된 전체 강의 수 조회 (수강생에게 공개된 강의만 카운트 - 수정됨)
            // 기존: long totalLectures =
            // lectureRepository.countByCourseAndApprovalStatus(course,
            // LectureApprovalStatus.APPROVED);
            long totalLectures = lectureRepository.countVisibleLecturesByCourseId(course.getCourseId());

            // 강의가 하나도 없으면 건너김
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

    // 관리자용: 시스템 전체 시험 목록 조회
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }
}
