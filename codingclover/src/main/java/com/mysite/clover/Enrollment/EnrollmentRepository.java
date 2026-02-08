package com.mysite.clover.Enrollment;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;

/*수강 관련 비즈니스 로직 처리 */
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // 중복 수강 방지(중복확인)
    boolean existsByUserAndCourseAndStatus(
            Users user,
            Course course,
            EnrollmentStatus status);

    // 사용자 수강 목록 조회
    List<Enrollment> findByUser(Users user);

    // 상태별 수강 목록 조회
    List<Enrollment> findByUserAndStatus(Users user, EnrollmentStatus status);

    // 강좌별 수강생 조회
    List<Enrollment> findByCourseAndStatus(Course course, EnrollmentStatus status);

    // 취소/완료 대상 조회
    Optional<Enrollment> findByUserAndCourseAndStatus(
            Users user,
            Course course,
            EnrollmentStatus status);

    // 여러 상태로 수강 조회 (진도 조회 등에서 ENROLLED + COMPLETED 모두 허용)
    Optional<Enrollment> findByUserAndCourseAndStatusIn(
            Users user,
            Course course,
            List<EnrollmentStatus> statuses);

    // 내 수강 목록 조회 (N+1 방지 : Enrollment 목록 N개를 조회하더라도 user / course 접근 시 추가 쿼리가 발생하지
    // 않도록 미리 JOIN으로 다 가져온다)
    @Query("""
            SELECT e FROM Enrollment e
            JOIN FETCH e.user
            JOIN FETCH e.course
            WHERE e.user = :user
            """)
    List<Enrollment> findWithUserAndCourseByUser(@Param("user") Users user);

    // 강사의 강좌별 수강생 조회
    @Query("""
            SELECT e FROM Enrollment e
            JOIN FETCH e.user
            JOIN FETCH e.course
            WHERE e.course.createdBy = :instructor AND e.course = :course
            """)
    List<Enrollment> findByInstructorAndCourse(@Param("instructor") Users instructor, @Param("course") Course course);

    // 강사의 모든 강좌 수강생 조회
    @Query("""
            SELECT e FROM Enrollment e
            JOIN FETCH e.user
            JOIN FETCH e.course
            WHERE e.course.createdBy = :instructor
            """)
    List<Enrollment> findByInstructor(@Param("instructor") Users instructor);

    // 관리자용 전체 조회 (N+1 방지)
    @Query("""
            SELECT e FROM Enrollment e
            JOIN FETCH e.user
            JOIN FETCH e.course
            LEFT JOIN FETCH e.cancelledBy
            """)
    List<Enrollment> findAllWithUserAndCourse();

    // 관리자용 특정 강좌 수강생 조회 (N+1 방지)
    @Query("""
            SELECT e FROM Enrollment e
            JOIN FETCH e.user
            JOIN FETCH e.course
            LEFT JOIN FETCH e.cancelledBy
            WHERE e.course = :course
            """)
    List<Enrollment> findAdminByCourse(@Param("course") Course course);

    // Course 객체 없이 ID로 조회
    Optional<Enrollment> findByUserAndCourse_CourseId(Users user, Long courseId);
}
