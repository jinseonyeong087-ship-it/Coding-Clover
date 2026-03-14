package com.mysite.clover.QnaAnswer;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.mysite.clover.Users.Users;

public interface QnaAnswerRepository extends JpaRepository<QnaAnswer, Long> {

  // 강사가 답변한 질문 리스트 최신순 정렬
  List<QnaAnswer> findAllByInstructorOrderByAnsweredAtDesc(Users instructor);

}
