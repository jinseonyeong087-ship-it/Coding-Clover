package com.mysite.clover.Lecture;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;

// 개별 강의 정보(Lecture)에 대한 DB DB 작업을 담당하는 리포지토리
public interface LectureRepository extends JpaRepository<Lecture, Long> {

        // 특정 강좌에 속한 모든 강의를 순서(orderNo)대로 정렬하여 조회
        List<Lecture> findByCourseOrderByOrderNoAsc(Course course);

        // 특정 강사(User)가 생성한 모든 강의 목록 조회 (강사 마이페이지 등에서 사용)
        List<Lecture> findByCreatedBy(Users user);

        // 승인 상태(PENDING, APPROVED 등)에 따른 강의 목록 조회 (관리자용)
        List<Lecture> findByApprovalStatus(LectureApprovalStatus approvalStatus);

        // 특정 강좌 내에서 특정 승인 상태인 강의만 조회하고 순서대로 정렬 (예: 수강생에게 공개된 강의만 조회)
        List<Lecture> findByCourseAndApprovalStatusOrderByOrderNoAsc(Course course,
                        LectureApprovalStatus approvalStatus);

        // 특정 강좌의 특정 승인 상태인 강의 개수를 반환 (예: 승인된 강의가 몇 개인지 확인)
        long countByCourseAndApprovalStatus(Course course, LectureApprovalStatus approvalStatus);

        // 승인(APPROVED) 상태이며, 예약 시간이 현재 시간보다 이전(또는 즉시 공개)인 강의만 조회
        @Query("SELECT l FROM Lecture l " +
                        "WHERE l.course.courseId = :courseId " +
                        "AND l.approvalStatus = 'APPROVED' " +
                        "AND (l.uploadType = 'IMMEDIATE' OR l.scheduledAt <= CURRENT_TIMESTAMP) " +
                        "ORDER BY l.orderNo ASC")
        List<Lecture> findVisibleLecturesByCourseId(@Param("courseId") Long courseId);

        // 해당 강좌에 이미 존재하는 순서(orderNo)들만 조회 (프론트 드롭다운 처리용)
        @Query("SELECT l.orderNo FROM Lecture l WHERE l.course.id = :courseId")
        List<Integer> findOrderNosByCourseId(@Param("courseId") Long courseId);

        // 저장 전 중복 검사용 (안전장치)

        boolean existsByCourseCourseIdAndOrderNo(Long courseId, Integer orderNo);

        // 특정 강좌(CourseId)에 속한 강의들을 순서(OrderNo)대로 조회
        List<Lecture> findByCourse_CourseIdOrderByOrderNoAsc(Long courseId);

        // 강의 제목(title)으로 검색하는 기능 추가
        Page<Lecture> findByTitleContaining(String title, Pageable pageable);

        // 승인(APPROVED) 상태이며, 예약 시간이 현재 시간보다 이전(또는 즉시 공개)인 강의 개수 조회 (진도율 계산용)
        // 수강생 화면과 동일한 기준으로 전체 강의 수를 계산하기 위해 사용
}
