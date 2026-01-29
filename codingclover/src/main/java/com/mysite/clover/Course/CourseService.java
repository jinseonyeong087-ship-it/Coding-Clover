package com.mysite.clover.Course;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mysite.clover.Enrollment.Enrollment;
import com.mysite.clover.Enrollment.EnrollmentRepository;
import com.mysite.clover.Enrollment.EnrollmentStatus;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UsersRepository usersRepository;

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

        // 4. 새로운 Enrollment(수강) 엔티티 생성 및 설정
        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setStatus(EnrollmentStatus.ENROLLED); // 상태를 '수강 중'으로 설정

        // 5. DB에 저장
        enrollmentRepository.save(enrollment);
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
    }
}
