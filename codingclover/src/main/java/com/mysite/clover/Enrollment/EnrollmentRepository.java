package com.mysite.clover.Enrollment;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

  //중복 수강 방지(중복확인)
  boolean existsByUserAndCourseAndStatus(
      Users user,
      Course course,
      EnrollmentStatus status
  );

  //사용자 수강 목록 조회
  List<Enrollment> findByUser(Users user); 

  //상태별 수강 목록 조회
  List<Enrollment> findByUserAndStatus(Users user, EnrollmentStatus status);  

  //강좌별 수강생 조회
  List<Enrollment> findByCourseAndStatus(Course course, EnrollmentStatus status);

  // 취소/완료 대상 조회
  Optional<Enrollment> findByUserAndCourseAndStatus(
      Users user,
      Course course,
      EnrollmentStatus status
  );

  //화면 출력용 (N+1 방지)
  @Query("""
      SELECT e FROM Enrollment e
      JOIN FETCH e.user
      JOIN FETCH e.course
      WHERE e.user = :user
      """)
  List<Enrollment> findWithUserAndCourseByUser(Users user);

  // 강사의 강좌별 수강생 조회
  @Query("""
      SELECT e FROM Enrollment e 
      JOIN FETCH e.user 
      JOIN FETCH e.course 
      WHERE e.course.createdBy = :instructor AND e.course = :course
      """)
  List<Enrollment> findByInstructorAndCourse(Users instructor, Course course);

  // 강사의 모든 강좌 수강생 조회
  @Query("""
      SELECT e FROM Enrollment e 
      JOIN FETCH e.user 
      JOIN FETCH e.course 
      WHERE e.course.createdBy = :instructor
      """)
  List<Enrollment> findByInstructor(Users instructor);

  // 관리자용 전체 조회 (N+1 방지)
  @Query("""
      SELECT e FROM Enrollment e 
      JOIN FETCH e.user 
      JOIN FETCH e.course 
      LEFT JOIN FETCH e.cancelledBy
      """)
  List<Enrollment> findAllWithUserAndCourse();

  
}
