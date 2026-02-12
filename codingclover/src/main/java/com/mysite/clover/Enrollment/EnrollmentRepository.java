package com.mysite.clover.Enrollment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

        // 사용자와 강좌 조합 존재 여부 확인 (모든 상태)
        boolean existsByUserAndCourse(Users user, Course course);

        // 취소된 수강을 다시 활성화 (UPDATE)
        @Modifying
        @Query("UPDATE Enrollment e SET e.status = :newStatus, e.enrolledAt = :enrolledAt, e.cancelledAt = null, e.cancelledBy = null " +
               "WHERE e.user = :user AND e.course = :course AND e.status = :oldStatus")
        int reactivateEnrollment(@Param("user") Users user, 
                                 @Param("course") Course course,
                                 @Param("oldStatus") EnrollmentStatus oldStatus,
                                 @Param("newStatus") EnrollmentStatus newStatus,
                                 @Param("enrolledAt") LocalDateTime enrolledAt);

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

        // 강사의 모든 강좌 수강생 조회
        @Query("""
                        SELECT e FROM Enrollment e
                        JOIN FETCH e.user
                        JOIN FETCH e.course
                        WHERE e.course.createdBy = :instructor
                        """)
        List<Enrollment> findByInstructor(@Param("instructor") Users instructor);

        // 관리자 전체 수강 조회 - 사용자, 강좌, 취소처리자 정보를 한 번에 가져옴 (추가 쿼리 방지)
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

        // 강좌 삭제 시 관련 수강 내역 삭제
        void deleteByCourse(Course course);

        // 사용자별 수강 신청 수 계산 (user.userId로 접근)
        int countByUserUserId(Long userId);

        // 사용자의 최근 수강 신청 내역 조회 (최근 활동일 계산용, user.userId로 접근)
        Optional<Enrollment> findTopByUserUserIdOrderByEnrolledAtDesc(Long userId);

        // 취소 요청 목록 조회 (전체) - cancelledAt이 있으면서 status가 ENROLLED
        @Query("SELECT e FROM Enrollment e WHERE e.cancelledAt IS NOT NULL AND e.status = :status ORDER BY e.cancelledAt DESC")
        List<Enrollment> findPendingCancelRequestsOrderByCancelledAtDesc(@Param("status") EnrollmentStatus status);

        // 사용자별 취소 요청 목록 조회
        @Query("SELECT e FROM Enrollment e WHERE e.user = :user AND e.cancelledAt IS NOT NULL AND e.status = :status ORDER BY e.cancelledAt DESC")
        List<Enrollment> findUserPendingCancelRequestsOrderByCancelledAtDesc(@Param("user") Users user, @Param("status") EnrollmentStatus status);


        // 기존 status 기반 조회 메서드들 (하위 호환성 유지)
        List<Enrollment> findByStatusOrderByCancelledAtDesc(EnrollmentStatus status);
        List<Enrollment> findByUserAndStatusOrderByCancelledAtDesc(Users user, EnrollmentStatus status);
}
