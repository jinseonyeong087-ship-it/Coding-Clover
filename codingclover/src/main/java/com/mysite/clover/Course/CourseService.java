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
    private final UsersRepository usersRepository;
    private final com.mysite.clover.Notification.NotificationService notificationService;
    private final com.mysite.clover.Payment.PaymentService paymentService;
    private final com.mysite.clover.WalletHistory.WalletHistoryService walletHistoryService;

    // [조회 로직]

    // 전체 강좌 목록 조회 (관리자용 - 승인/미승인 모두 포함)
    public List<Course> getList() {
        return courseRepository.findAll();
    }

    // 승인 대기중인(PENDING) 강좌 목록 조회 (관리자가 승인 작업을 위해 조회)
    public List<Course> getPendingList() {
        return courseRepository.findByProposalStatus(CourseProposalStatus.PENDING);
    }

    // 승인된(APPROVED) 강좌 목록 조회 (일반 사용자 및 학생에게 노출)
    // [변경] 강의가 1개 이상 있는 강좌만 노출되도록 변경
    public List<Course> getPublicList() {
        return courseRepository.findApprovedCoursesWithLectures();
    }

    // 승인된 강좌 중 특정 레벨에 해당하는 목록 조회 (필터링)
    // [변경] 강의가 1개 이상 있는 강좌만 노출되도록 변경
    public List<Course> getPublicListByLevel(int level) {
        return courseRepository.findApprovedCoursesWithLecturesByLevel(level);
    }

    // 특정 강사가 개설한 강좌 목록 조회
    public List<Course> getInstructorList(Users instructor) {
        return courseRepository.findByCreatedByUserId(instructor.getUserId());
    }

    // 강좌 상세 조회 (ID로 조회, 없으면 예외 발생)
    public Course getCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("강좌 없음"));
    }

    // [강사 기능: 생성/수정/삭제]

    // 신규 강좌 생성 (강사가 개설 요청)
    @Transactional
    public void create(String title, String description, int level, int price, String thumbnailUrl, Users user,
            CourseProposalStatus status) {
        // 1. 새로운 강좌 엔티티 생성
        Course course = new Course();
        // 2. 전달받은 정보로 엔티티 필드 설정
        course.setTitle(title);
        course.setDescription(description);
        course.setLevel(level);
        course.setPrice(price);
        course.setThumbnailUrl(thumbnailUrl);
        course.setCreatedBy(user); // 개설자 설정
        course.setCreatedAt(LocalDateTime.now()); // 생성 시간 설정
        course.setProposalStatus(status); // 승인 상태 설정 (보통 PENDING 요청됨)

        // 3. DB에 저장
        courseRepository.save(course);

        // 4. 관리자에게 알림 전송 (신규 승인 요청인 경우)
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

    // 강좌 정보 수정 (강사 본인 강좌 수정)
    @Transactional
    public void update(Long id, String title, String description, int level, int price, String thumbnailUrl) {
        // 1. 수정할 강좌 엔티티 조회
        Course course = getCourse(id);

        // 2. 엔티티 필드 값 업데이트 (Setter 사용 - Dirty Checking)
        course.setTitle(title);
        course.setDescription(description);
        course.setLevel(level);
        course.setPrice(price);
        course.setThumbnailUrl(thumbnailUrl);
        course.setUpdatedAt(LocalDateTime.now()); // 수정 시간 갱신

        // 트랜잭션 종료 시 Dirty Checking으로 자동 update 쿼리 실행
    }

    // 강좌 삭제 (강사 본인 강좌 삭제)
    @Transactional
    public void delete(Course course) {
        // 전달받은 강좌 엔티티를 DB에서 삭제
        courseRepository.delete(course);
    }

    // [수강 관련 연계 로직]

    // 학생이 수강 중인 강좌 목록 조회 (Enrollment를 통해 간접 조회)
    public List<Course> getStudentList(Users student) {
        // 1. Enrollment 리포지토리에서 학생이 수강 중인 강좌 정보(Enrollment) 조회
        return enrollmentRepository.findWithUserAndCourseByUser(student).stream()
                // 2. Enrollment 엔티티에서 Course 엔티티 추출
                .map(Enrollment::getCourse)
                // 3. Course 리스트로 변환하여 반환
                .collect(Collectors.toList());
    }

    // 수강 신청 처리 (학생이 강좌를 수강 신청함)
    @Transactional
    public void enroll(Long courseId, String loginId) {
        // 1. 로그인 ID로 사용자 조회
        Users user = usersRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 2. 강좌 ID로 강좌 조회
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("강좌를 찾을 수 없습니다."));

        // 3. 이미 수강 중인지 중복 체크 (EnrollmentStatus.ENROLLED 상태 확인)
        if (enrollmentRepository.existsByUserAndCourseAndStatus(user, course, EnrollmentStatus.ENROLLED)) {
            throw new RuntimeException("이미 수강 중인 강좌입니다.");
        }

        // 4. 수강료 확인 및 포인트 차감
        int price = course.getPrice();
        System.out.println("수강료: " + price + "원, 강좌: " + course.getTitle());

        if (price > 0) {
            try {
                // 포인트 차감 및 결제 리스트 기록 (PaymentService 사용)
                // orderId에 COURSE_{courseId} 형식으로 저장하여 환불 시 식별
                paymentService.usePoints(user.getUserId(), price, "COURSE_" + courseId);
                System.out.println("수강료 결제 완료: " + price + "원");
                // walletHistoryService.recordUse는 paymentService.usePoints 내부에서 처리되므로 중복 호출 제거
            } catch (Exception e) {
                String errorMsg = "수강료 결제 실패: " + e.getMessage();
                System.out.println(errorMsg);
                throw new RuntimeException(errorMsg);
            }
        }

        // 5. 새로운 Enrollment(수강) 엔티티 생성 및 설정
        Enrollment enrollment = new Enrollment(user, course); // 매개변수 생성자 사용

        // 5. DB에 저장
        enrollmentRepository.save(enrollment); // 6. DB에 저장

        // 7. 강사에게 알림 전송 (수강생 등록)
        notificationService.createNotification(
                course.getCreatedBy(),
                "NEW_ENROLLMENT",
                "'" + course.getTitle() + "' 강좌에 " + user.getName() + "님이 수강 신청했습니다.",
                // 강사용 강좌 관리 페이지 (가정)
                "/instructor/course/" + courseId);
    }

    // 특정 강좌를 수강 중인 학생(User) 목록 조회
    public List<Users> getEnrolledStudents(Long courseId) {
        // 1. 강좌 ID로 강좌 엔티티 조회
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("강좌를 찾을 수 없습니다."));

        // 2. 해당 강좌의 수강 내역(Enrollment) 조회 후 학생(User) 목록 추출
        return enrollmentRepository.findAdminByCourse(course).stream()
                // Enrollment에서 User 추출
                .map(Enrollment::getUser)
                // 리스트 변환
                .collect(Collectors.toList());
    }

    // [관리자 기능: 승인/반려]

    // 관리자 기능: 강좌 승인 처리
    @Transactional
    public void approve(Course course, Users admin) {
        // 1. 강좌 상태를 APPROVED로 변경
        course.setProposalStatus(CourseProposalStatus.APPROVED);
        // 2. 승인한 관리자 정보 설정
        course.setApprovedBy(admin);
        // 3. 승인 시간 설정
        course.setApprovedAt(LocalDateTime.now());

        // 4. 변경사항 저장
        courseRepository.save(course);

        // 5. 알림 전송
        notificationService.createNotification(
                course.getCreatedBy(),
                "COURSE_APPROVED",
                "강좌 '" + course.getTitle() + "' 승인됨",
                "/instructor/course/" + course.getCourseId());
    }

    // 관리자 기능: 강좌 반려 처리
    @Transactional
    public void reject(Course course, String reason) {
        // 1. 강좌 상태를 REJECTED로 변경
        course.setProposalStatus(CourseProposalStatus.REJECTED);
        // 2. 반려 사유 설정
        course.setProposalRejectReason(reason);

        // 3. 변경사항 저장
        courseRepository.save(course);

        // 4. 알림 전송
        notificationService.createNotification(
                course.getCreatedBy(),
                "COURSE_REJECTED",
                "강좌 '" + course.getTitle() + "' 반려됨: " + reason,
                "/instructor/course/" + course.getCourseId());
    }

    public List<Course> getCoursesByInstructor(String loginId) {
        List<Course> list = courseRepository.findByCreatedBy_LoginId(loginId);
        return list != null ? list : new ArrayList<>(); // null 대신 빈 리스트 반환
    }

    // 강좌 재제출 (반려된 강좌 수정 후 재요청)
    // [파라미터 설명]
    // - courseId: 재심사 요청할 강좌의 ID
    // - request: 프론트엔드에서 전달받은 수정된 강좌 정보 (CourseCreateRequest는 @Getter/@Setter가 있어서
    // 값 설정/조회 가능)
    // - loginId: 현재 로그인한 강사의 ID (본인 확인용)
    @Transactional
    public void resubmitCourse(Long courseId, CourseCreateRequest request, String loginId) {
        // 1. 기존 강좌 조회
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강좌입니다."));

        // 2. 소유자 권한 체크 (본인이 만든 강좌인지 확인)
        if (!course.getCreatedBy().getLoginId().equals(loginId)) {
            throw new SecurityException("본인의 강좌만 수정할 수 있습니다.");
        }

        // 3. 기존 데이터 업데이트 (CourseCreateRequest의 getter로 값 조회)
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setLevel(request.getLevel());
        course.setPrice(request.getPrice());
        course.setThumbnailUrl(request.getThumbnailUrl());

        // 4. 승인 상태 초기화 (핵심)
        // 상태를 다시 PENDING으로 변경하여 관리자 대기 목록에 보이게 함
        course.setProposalStatus(CourseProposalStatus.PENDING);
        // 기존 반려 사유 제거
        course.setProposalRejectReason(null);

        // Dirty Checking에 의해 트랜잭션 종료 시 자동 업데이트 (save 호출 생략 가능)

        // 5. 관리자에게 알림 전송 (재승인 요청)
        List<Users> admins = usersRepository.findByRole(com.mysite.clover.Users.UsersRole.ADMIN);
        for (Users admin : admins) {
            notificationService.createNotification(
                    admin,
                    "COURSE_RESUBMITTED",
                    "강사 " + course.getCreatedBy().getName() + "님의 강좌 재승인 요청: '" + course.getTitle() + "'",
                    "/admin/course/" + course.getCourseId());
        }
    }

    // [New] 강좌 임시 저장 (DRAFT)
    @Transactional
    public Long saveDraft(CourseCreateRequest request, Users instructor) {
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setLevel(request.getLevel());
        course.setPrice(request.getPrice());
        course.setThumbnailUrl(request.getThumbnailUrl());

        course.setCreatedBy(instructor);
        course.setProposalStatus(CourseProposalStatus.DRAFT); // DRAFT 상태
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());

        // 필수값 검증 없이 저장
        return courseRepository.save(course).getCourseId();
    }

    // [New] 임시 저장 강좌 최종 제출 (승인 요청)
    @Transactional
    public void submitDraft(Long courseId, CourseCreateRequest request, String loginId) {
        Course course = getCourse(courseId);

        // 권한 체크
        if (!course.getCreatedBy().getLoginId().equals(loginId)) {
            throw new SecurityException("권한이 없습니다.");
        }

        // 제출 시 필수값 검증
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("강좌 제목은 필수입니다.");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("강좌 설명은 필수입니다.");
        }
        if (request.getLevel() <= 0) {
            throw new IllegalArgumentException("난이도 설정은 필수입니다.");
        }
        // ThumbnailUrl 필수는 기획에 따라 결정 (여기선 필수로 가정)
        if (request.getThumbnailUrl() == null || request.getThumbnailUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("썸네일 이미지는 필수입니다.");
        }

        // 데이터 업데이트
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setLevel(request.getLevel());
        course.setPrice(request.getPrice());
        course.setThumbnailUrl(request.getThumbnailUrl());

        // 상태 변경: DRAFT -> PENDING
        course.setProposalStatus(CourseProposalStatus.PENDING);
        course.setUpdatedAt(LocalDateTime.now());

        // 관리자에게 알림 전송 (승인 요청)
        List<Users> admins = usersRepository.findByRole(com.mysite.clover.Users.UsersRole.ADMIN);
        for (Users admin : admins) {
            notificationService.createNotification(
                    admin,
                    "NEW_COURSE_REQUEST",
                    "강사 " + course.getCreatedBy().getName() + "님의 신규 강좌 승인 요청: '" + course.getTitle() + "'",
                    "/admin/course/" + course.getCourseId());
        }
    }
    
    // [추천 기능]
    
    /**
     * 학습 수준에 따른 추천 강좌 목록 조회
     * 입문→초급, 초급→중급, 중급→고급 강좌 추천
     */
    public List<Course> getRecommendedCourses(String educationLevel) {
        int targetLevel = getTargetLevelForRecommendation(educationLevel);
        List<Course> recommendedCourses = getPublicListByLevel(targetLevel);
        
        // 해당 레벨에 강좌가 없으면 초급(1) 강좌 반환
        if (recommendedCourses.isEmpty() && targetLevel != 1) {
            recommendedCourses = getPublicListByLevel(1);
        }
        
        return recommendedCourses;
    }
    
    /**
     * 학습 수준에 따른 추천 타겟 레벨 결정
     * 입문: 1 (초급 강좌), 초급: 2 (중급 강좌), 중급: 3 (고급 강좌)
     */
    private int getTargetLevelForRecommendation(String educationLevel) {
        if (educationLevel == null || educationLevel.isEmpty() || "미설정".equals(educationLevel)) {
            return 1; // 기본값: 초급 강좌
        }
        
        switch (educationLevel.toLowerCase()) {
            case "입문":
            case "입문 (코딩 경험 없음)":
            case "beginner":
                return 1; // 초급 강좌 추천
            case "초급":
            case "초급 (기초 문법 이해)":
            case "elementary":
                return 2; // 중급 강좌 추천
            case "중급":
            case "중급 (프로젝트 경험 있음)":
            case "intermediate":
                return 3; // 고급 강좌 추천
            case "고급":
            case "advanced":
            case "상급":
                return 3; // 고급이 최고 레벨이므로 고급 강좌 유지
            default:
                return 1; // 알 수 없는 값일 경우 초급 강좌
        }
    }
}
