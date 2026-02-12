package com.mysite.clover.Course;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mysite.clover.Course.dto.CourseCreateRequest;
import com.mysite.clover.Enrollment.Enrollment;
import com.mysite.clover.Enrollment.EnrollmentRepository;
import com.mysite.clover.Enrollment.EnrollmentStatus;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final com.mysite.clover.Lecture.LectureRepository lectureRepository;
    private final com.mysite.clover.Exam.ExamRepository examRepository;
    private final UsersRepository usersRepository;
    private final com.mysite.clover.Notification.NotificationService notificationService;
    private final com.mysite.clover.Payment.PaymentService paymentService;

    // [조회]

    // 전체 강좌 목록
    public List<Course> getList() {
        return courseRepository.findAll();
    }

    // 승인 대기 목록
    public List<Course> getPendingList() {
        return courseRepository.findByProposalStatus(CourseProposalStatus.PENDING);
    }

    // 공개 강좌 목록 (강의 1개 이상)
    public List<Course> getPublicList() {
        return courseRepository.findApprovedCoursesWithLectures();
    }

    // 레벨별 공개 강좌 목록
    public List<Course> getPublicListByLevel(int level) {
        return courseRepository.findApprovedCoursesWithLecturesByLevel(level);
    }

    // 강사별 강좌 목록
    public List<Course> getInstructorList(Users instructor) {
        return courseRepository.findByCreatedByUserId(instructor.getUserId());
    }

    // 강좌 상세 조회
    public Course getCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("강좌 없음"));
    }

    // [강사 기능]

    // 강좌 생성
    @Transactional
    public void create(String title, String description, int level, int price, String thumbnailUrl, Users user,
            CourseProposalStatus status) {
        Course course = new Course();
        course.setTitle(title);
        course.setDescription(description);
        course.setLevel(level);
        course.setPrice(price);
        course.setThumbnailUrl(thumbnailUrl);
        course.setCreatedBy(user);
        course.setCreatedAt(LocalDateTime.now());
        course.setProposalStatus(status);

        courseRepository.save(course);

        // 관리자 알림
        if (status == CourseProposalStatus.PENDING) {
            List<Users> admins = usersRepository.findByRole(com.mysite.clover.Users.UsersRole.ADMIN);
            for (Users admin : admins) {
                notificationService.createNotification(
                        admin,
                        "NEW_COURSE_REQUEST",
                        "강사 " + user.getName() + "님의 신규 강좌 승인 요청: '" + title + "'",
                        "/admin/course/" + course.getCourseId());
            }
        }
    }

    // 강좌 수정
    @Transactional
    public void update(Long id, String title, String description, int level, int price, String thumbnailUrl) {
        Course course = getCourse(id);
        course.setTitle(title);
        course.setDescription(description);
        course.setLevel(level);
        course.setPrice(price);
        course.setThumbnailUrl(thumbnailUrl);
        course.setUpdatedAt(LocalDateTime.now());
    }

    // 강좌 삭제
    @Transactional
    public void delete(Course course) {
        enrollmentRepository.deleteByCourse(course);
        lectureRepository.deleteByCourse(course);
        examRepository.deleteByCourse(course);
        courseRepository.delete(course);
    }

    // [수강 관련]

    // 학생 수강 목록
    public List<Course> getStudentList(Users student) {
        return enrollmentRepository.findWithUserAndCourseByUser(student).stream()
                .map(Enrollment::getCourse)
                .collect(Collectors.toList());
    }

    // 수강 신청
    @Transactional
    public void enroll(Long courseId, String loginId) {
        Users user = usersRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("강좌를 찾을 수 없습니다."));

        if (enrollmentRepository.existsByUserAndCourseAndStatus(user, course, EnrollmentStatus.ENROLLED)) {
            throw new RuntimeException("이미 수강 중인 강좌입니다.");
        }

        boolean recordExists = enrollmentRepository.existsByUserAndCourse(user, course);

        int price = course.getPrice();
        if (price > 0) {
            try {
                paymentService.usePoints(user.getUserId(), price, "COURSE_" + courseId);
            } catch (Exception e) {
                throw new RuntimeException("수강료 결제 실패: " + e.getMessage());
            }
        }

        if (recordExists) {
            // 기존 레코드 재활성화
            int updatedRows = enrollmentRepository.reactivateEnrollment(
                    user,
                    course,
                    EnrollmentStatus.CANCELLED,
                    EnrollmentStatus.ENROLLED,
                    LocalDateTime.now());

            if (updatedRows == 0) {
                throw new RuntimeException("해당 강좌의 수강 내역이 이미 처리되었습니다.");
            }
        } else {
            // 신규 수강 등록
            Enrollment enrollment = new Enrollment(user, course);
            enrollmentRepository.save(enrollment);
        }

        // 강사 알림
        notificationService.createNotification(
                course.getCreatedBy(),
                "NEW_ENROLLMENT",
                "'" + course.getTitle() + "' 강좌에 " + user.getName() + "님이 수강 신청했습니다.",
                "/instructor/course/" + courseId);
    }

    // 수강 학생 목록
    public List<Users> getEnrolledStudents(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("강좌를 찾을 수 없습니다."));

        return enrollmentRepository.findAdminByCourse(course).stream()
                .map(Enrollment::getUser)
                .collect(Collectors.toList());
    }

    // [관리자 기능]

    // 강좌 승인
    @Transactional
    public void approve(Course course, Users admin) {
        course.setProposalStatus(CourseProposalStatus.APPROVED);
        course.setApprovedBy(admin);
        course.setApprovedAt(LocalDateTime.now());

        // 알림 전송
        notificationService.createNotification(
                course.getCreatedBy(),
                "COURSE_APPROVED",
                "강좌 '" + course.getTitle() + "' 승인됨",
                "/instructor/course/" + course.getCourseId());
    }

    // 강좌 반려
    @Transactional
    public void reject(Course course, String reason) {
        course.setProposalStatus(CourseProposalStatus.REJECTED);
        course.setProposalRejectReason(reason);

        // 알림 전송
        notificationService.createNotification(
                course.getCreatedBy(),
                "COURSE_REJECTED",
                "강좌 '" + course.getTitle() + "' 반려됨: " + reason,
                "/instructor/course/" + course.getCourseId());
    }

    // 강사별 강좌 목록 (ID 사용)
    public List<Course> getCoursesByInstructor(String loginId) {
        List<Course> list = courseRepository.findByCreatedBy_LoginId(loginId);
        return list != null ? list : new ArrayList<>();
    }

    // 강좌 재제출
    @Transactional
    public void resubmitCourse(Long courseId, CourseCreateRequest request, String loginId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강좌입니다."));

        if (!course.getCreatedBy().getLoginId().equals(loginId)) {
            throw new SecurityException("본인의 강좌만 수정할 수 있습니다.");
        }

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setLevel(request.getLevel());
        course.setPrice(request.getPrice());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setProposalStatus(CourseProposalStatus.PENDING);
        course.setProposalRejectReason(null);

        // 관리자 알림
        List<Users> admins = usersRepository.findByRole(com.mysite.clover.Users.UsersRole.ADMIN);
        for (Users admin : admins) {
            notificationService.createNotification(
                    admin,
                    "COURSE_RESUBMITTED",
                    "강사 " + course.getCreatedBy().getName() + "님의 강좌 재승인 요청: '" + course.getTitle() + "'",
                    "/admin/course/" + course.getCourseId());
        }
    }

    // 강좌 임시 저장
    @Transactional
    public Long saveDraft(CourseCreateRequest request, Users instructor) {
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setLevel(request.getLevel());
        course.setPrice(request.getPrice());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setCreatedBy(instructor);
        course.setProposalStatus(CourseProposalStatus.DRAFT);
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());

        return courseRepository.save(course).getCourseId();
    }

    // 임시 저장 제출
    @Transactional
    public void submitDraft(Long courseId, CourseCreateRequest request, String loginId) {
        Course course = getCourse(courseId);

        if (!course.getCreatedBy().getLoginId().equals(loginId)) {
            throw new SecurityException("권한이 없습니다.");
        }

        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("강좌 제목은 필수입니다.");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("강좌 설명은 필수입니다.");
        }
        if (request.getLevel() <= 0) {
            throw new IllegalArgumentException("난이도 설정은 필수입니다.");
        }
        if (request.getThumbnailUrl() == null || request.getThumbnailUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("썸네일 이미지는 필수입니다.");
        }

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setLevel(request.getLevel());
        course.setPrice(request.getPrice());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setProposalStatus(CourseProposalStatus.PENDING);
        course.setUpdatedAt(LocalDateTime.now());

        // 관리자 알림
        List<Users> admins = usersRepository.findByRole(com.mysite.clover.Users.UsersRole.ADMIN);
        for (Users admin : admins) {
            notificationService.createNotification(
                    admin,
                    "NEW_COURSE_REQUEST",
                    "강사 " + course.getCreatedBy().getName() + "님의 신규 강좌 승인 요청: '" + course.getTitle() + "'",
                    "/admin/course/" + course.getCourseId());
        }
    }

    // [추천]

    // 학습 수준 맞춤 추천
    public List<Course> getRecommendedCourses(String educationLevel) {
        int targetLevel = getTargetLevelForRecommendation(educationLevel);
        List<Course> recommendedCourses = getPublicListByLevel(targetLevel);

        if (recommendedCourses.isEmpty() && targetLevel != 1) {
            recommendedCourses = getPublicListByLevel(1);
        }

        return recommendedCourses;
    }

    // 타겟 레벨 결정
    private int getTargetLevelForRecommendation(String educationLevel) {
        if (educationLevel == null || educationLevel.isEmpty() || "미설정".equals(educationLevel)) {
            return 1;
        }

        switch (educationLevel.toLowerCase()) {
            case "입문":
            case "입문 (코딩 경험 없음)":
            case "beginner":
                return 1;
            case "초급":
            case "초급 (기초 문법 이해)":
            case "elementary":
                return 2;
            case "중급":
            case "중급 (프로젝트 경험 있음)":
            case "intermediate":
                return 3;
            case "고급":
            case "advanced":
            case "상급":
                return 3;
            default:
                return 1;
        }
    }
}
