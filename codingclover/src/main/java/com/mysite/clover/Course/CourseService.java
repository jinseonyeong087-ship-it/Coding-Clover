package com.mysite.clover.Course;

import java.time.LocalDateTime;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.mysite.clover.Enrollment.EnrollmentRepository;
import com.mysite.clover.Users.Users;

// 강좌 서비스
@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    /**
     * 전체 강좌 목록 조회 (관리자용)
     * 시스템 상의 모든 강좌 목록을 반환합니다.
     * 
     * @return 전체 강좌 목록
     */
    public List<Course> getList() {
        return courseRepository.findAll();
    }

    /**
     * 수강생 본인 강좌 목록 조회 (전체)
     * 수강생이 수강신청한 모든 강좌 목록(활성/완료/취소 포함 여부는 Enrollment 로직에 따름)을 조회합니다.
     * 
     * @param student 수강생 정보
     * @return 수강한 강좌 목록
     */
    public List<Course> getStudentList(Users student) {
        return enrollmentRepository.findWithUserAndCourseByUser(student).stream()
                .map(com.mysite.clover.Enrollment.Enrollment::getCourse)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 수강 중인 강좌 목록 조회
     * '수강 중(ENROLLED)' 상태인 강좌만 필터링하여 반환합니다.
     * 
     * @param student 수강생 정보
     * @return 수강 중인 강좌 목록
     */
    public List<Course> getStudentActiveList(Users student) {
        return enrollmentRepository.findWithUserAndCourseByUser(student).stream()
                .filter(e -> e.getStatus() == com.mysite.clover.Enrollment.EnrollmentStatus.ENROLLED)
                .map(com.mysite.clover.Enrollment.Enrollment::getCourse)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 수강 완료 강좌 목록 조회
     * '수강 완료(COMPLETED)' 상태인 강좌만 필터링하여 반환합니다.
     * 
     * @param student 수강생 정보
     * @return 수료한 강좌 목록
     */
    public List<Course> getStudentCompletedList(Users student) {
        return enrollmentRepository.findWithUserAndCourseByUser(student).stream()
                .filter(e -> e.getStatus() == com.mysite.clover.Enrollment.EnrollmentStatus.COMPLETED)
                .map(com.mysite.clover.Enrollment.Enrollment::getCourse)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 승인 대기 강좌 목록 조회 (관리자용)
     * 승인 상태가 'PENDING'인 강좌 목록을 반환합니다.
     * 
     * @return 승인 대기 강좌 목록
     */
    public List<Course> getPendingList() {
        return courseRepository.findByProposalStatus(CourseProposalStatus.PENDING);
    }

    /**
     * 공개된 강좌 목록 조회
     * 승인 상태가 'APPROVED'인 모든 강좌를 반환합니다.
     * 
     * @return 공개된 강좌 목록
     */
    public List<Course> getPublicList() {
        return courseRepository.findByProposalStatus(CourseProposalStatus.APPROVED);
    }

    /**
     * 레벨별 공개 강좌 목록 조회
     * 특정 레벨의 승인된 강좌 목록을 반환합니다.
     * 
     * @param level 강좌 레벨
     * @return 해당 레벨의 공개 강좌 목록
     */
    public List<Course> getPublicListByLevel(int level) {
        return courseRepository.findByProposalStatusAndLevel(CourseProposalStatus.APPROVED, level);
    }

    /**
     * 강사별 강좌 목록 조회
     * 특정 강사가 개설한 모든 강좌를 조회합니다.
     * 
     * @param instructor 강사 정보
     * @return 강사가 개설한 강좌 목록
     */
    public List<Course> getInstructorList(Users instructor) {
        return courseRepository.findByCreatedByUserId(instructor.getUserId());
    }

    /**
     * 강좌 생성
     * 새로운 강좌를 생성하여 저장합니다.
     * 
     * @param title       강좌 제목
     * @param description 강좌 설명
     * @param level       강좌 레벨
     * @param price       수강료
     * @param user        개설자 (강사)
     * @param status      초기 승인 상태
     */
    public void create(
            String title,
            String description,
            int level,
            int price,
            Users user,
            CourseProposalStatus status) {
        Course course = new Course();
        course.setTitle(title);
        course.setDescription(description);
        course.setLevel(level);
        course.setPrice(price);
        course.setCreatedBy(user);
        course.setCreatedAt(LocalDateTime.now());
        course.setProposalStatus(status); // 강사 요청시 PENDING
        courseRepository.save(course);
    }

    /**
     * 강좌 단건 조회
     * ID로 강좌를 조회하며, 존재하지 않을 경우 예외가 발생합니다.
     * 
     * @param id 강좌 ID
     * @return 조회된 강좌
     */
    public Course getCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("강좌 없음"));
    }

    /**
     * 강좌 승인
     * 강좌 상태를 APPROVED로 변경하고 승인 정보를 기록합니다.
     * 
     * @param course 대상 강좌
     * @param admin  승인한 관리자
     */
    public void approve(Course course, Users admin) {
        course.setProposalStatus(CourseProposalStatus.APPROVED);
        course.setApprovedBy(admin);
        course.setApprovedAt(LocalDateTime.now());
        courseRepository.save(course);
    }

    /**
     * 강좌 반려
     * 강좌 상태를 REJECTED로 변경하고 반려 사유를 기록합니다.
     * 
     * @param course 대상 강좌
     * @param reason 반려 사유
     */
    public void reject(Course course, String reason) {
        course.setProposalStatus(CourseProposalStatus.REJECTED);
        course.setProposalRejectReason(reason);
        courseRepository.save(course);
    }

    /**
     * 강좌 삭제
     * 강좌 데이터를 삭제합니다.
     * 
     * @param course 대상 강좌
     */
    public void delete(Course course) {
        courseRepository.delete(course);
    }
}
