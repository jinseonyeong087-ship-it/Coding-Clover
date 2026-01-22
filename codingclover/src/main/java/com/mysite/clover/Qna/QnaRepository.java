package com.mysite.clover.Qna;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;

public interface QnaRepository extends JpaRepository<Qna, Long>{

  // 리스트 최신순 정렬에 필요함
  List<Qna> findAllByOrderByCreatedAtDesc();

  //학생 개인 글 보기를 위함
  List<Qna> findAllByUsersOrderByCreatedAtDesc(Users users);

  // 강좌별 질문 조회 (강사)
  List<Qna> findAllByCourseOrderByCreatedAtDesc(Course course);
}
