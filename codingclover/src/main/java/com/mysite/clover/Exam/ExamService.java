package com.mysite.clover.Exam;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseRepository;
import com.mysite.clover.Users.Users;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LectureRepository lectureRepository;
    private final LectureProgressRepository lectureProgressRepository;

    /**
     * 강좌별 시험 목록 조회
     * 특정 강좌에 연결된 모든 시험을 조회합니다.
     * 
     * @param courseId 강좌 ID
     * @return 시험 목록
     */
    public List<Exam> getExamsByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("강좌를 찾을 수 없습니다."));
        return examRepository.findByCourse(course);
    }

    /**
     * 시험 상세 조회
     * ID로 시험을 조회하며, 존재하지 않을 경우 예외가 발생합니다.
     * 
     * @param examId 시험 ID
     * @return 조회된 시험
     */
    public Exam getExam(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("시험을 찾을 수 없습니다."));
    }

    /**
     * 시험 생성
     * 새로운 시험을 생성합니다.
     * 
     * @param courseId   연결될 강좌 ID
     * @param title      시험 제목
     * @param timeLimit  제한 시간
     * @param level      난이도
     * @param passScore  합격 기준 점수
     * @param boolean1 
     * @param instructor 등록 강사
     */
    @Transactional
    public void createExam(Long courseId, String title, Integer timeLimit, Integer level, Integer passScore,
            Boolean boolean1, Users instructor) {
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

    /**
     * 시험 응시 기록 저장
     * 시험 결과를 저장하고 시도 횟수를 증가시킵니다.
     * 
     * @param exam   시험
     * @param user   응시자
     * @param score  점수
     * @param passed 통과 여부
     */
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

    /**
     * 특정 시험의 응시 기록 조회 (강사용)
     * 해당 시험에 대한 모든 학생들의 응시 기록을 조회합니다.
     * 
     * @param examId 시험 ID
     * @return 응시 기록 목록
     */
    public List<ExamAttempt> getAttemptsByExam(Long examId) {
        Exam exam = getExam(examId);
        return examAttemptRepository.findByExam(exam);
    }

    /**
     * 전체 응시 기록 조회 (관리자용)
     * 시스템 상의 모든 응시 기록을 조회합니다.
     * 
     * @return 전체 응시 기록 목록
     */
    public List<ExamAttempt> getAllAttempts() {
        return examAttemptRepository.findAll();
    }

    /**
     * 강사별 시험 목록 조회
     * 특정 강사가 출제한 모든 시험을 조회합니다.
     * 
     * @param instructor 강사 정보
     * @return 시험 목록
     */
    public List<Exam> getExamsByInstructor(Users instructor) {
        // Repository method need to be added: findByCreatedBy
        // But wait, ExamRepository doesn't have it yet.
        // Let's assume we will add it.
        return examRepository.findByCreatedBy(instructor);
    }

    /**
     * 특정 시험의 본인 응시 기록 조회
     * 
     * @param examId 시험 ID
     * @param user   응시자
     * @return 본인의 응시 기록
     */
    public List<ExamAttempt> getAttemptsByExamAndUser(Long examId, Users user) {
        Exam exam = getExam(examId);
        return examAttemptRepository.findByExamAndUser(exam, user);
    }

    /**
     * 응시 가능한 시험 목록 조회
     * 수강 중인 강좌 중, 진도율이 80% 이상인 경우에만 해당 강좌의 시험을 목록에 포함시킵니다.
     * 
     * @param student 수강생 정보
     * @return 응시 가능한 시험 목록
     */
    public List<Exam> getStudentExams(Users student) {
        List<Exam> availableExams = new ArrayList<>();

        // 1. 학생이 수강 관련된(수강중, 수료) 강좌 조회 (CANCELLED 제외)
        List<Enrollment> allEnrollments = enrollmentRepository.findByUser(student);
        List<Enrollment> enrollments = new ArrayList<>();
        for (Enrollment e : allEnrollments) {
            if (e.getStatus() != EnrollmentStatus.CANCELLED) {
                enrollments.add(e);
            }
        }

        for (Enrollment enrollment : enrollments) {
            Course course = enrollment.getCourse();

            // 2. 강좌의 총 강의 수
            long totalLectures = lectureRepository.countByCourseAndApprovalStatus(course, "APPROVED");

            if (totalLectures == 0)
                continue;

            // 3. 수강생의 완료 강의 수
            long completedLectures = lectureProgressRepository.findByEnrollmentAndCompletedYnTrue(enrollment).size();

            // 4. 진도율 계산
            double progress = (double) completedLectures / totalLectures;

            // 5. 80% 이상이면 해당 강좌의 시험 목록 추가
            if (progress >= 0.8) {
                List<Exam> exams = examRepository.findByCourseAndIsPublishedTrue(course);
                availableExams.addAll(exams);
            }
        }
        return availableExams;
    }

    // 시험 수정
    @Transactional
    public void updateExam(Long examId, String title, Integer timeLimit, Integer level, Integer passScore, boolean isPublished) {
        // 시험 조회
        Exam exam = getExam(examId);
        // 시험 정보 업데이트
        exam.setTitle(title);
        // 제한 시간 업데이트
        exam.setTimeLimit(timeLimit);
        // 난이도 업데이트
        exam.setLevel(level);
        // 합격 기준 점수 업데이트
        exam.setPassScore(passScore);
        // 공개 여부 업데이트
        exam.setIsPublished(isPublished);
        // 공개 여부 업데이트
        examRepository.save(exam);
    }

    @Transactional
    public void deleteExam(Long examId) {
        // 시험 조회
        Exam exam = getExam(examId);
        // 시험 삭제
        examRepository.delete(exam);
    }

    public void updateExam(Long examId, ExamCreateRequest form) {
        throw new UnsupportedOperationException("Unimplemented method 'updateExam'");
    }
}
