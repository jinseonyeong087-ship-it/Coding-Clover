package com.mysite.clover.Qna;

import org.springframework.stereotype.Service;
import java.util.List;
import com.mysite.clover.Users.Users;
import lombok.RequiredArgsConstructor;
import java.util.Optional;
import com.mysite.clover.DataNotFoundException;
import java.time.LocalDateTime;
import com.mysite.clover.Course.Course;

@RequiredArgsConstructor
@Service
public class QnaService {
  private final QnaRepository qnaRepository;

  // 전체 질문 조회할때 겸 최신순 정렬 생성일 기준으로 짰음
  public List<Qna> getList() {
    return qnaRepository.findAllByOrderByCreatedAtDesc();
  }

  // 학생 개인 질문조회 이것도 최신순
  public List<Qna> getMyList(Users users) {
    return qnaRepository.findAllByUsersOrderByCreatedAtDesc(users);
  }

  // 질문 상세 조회
  public Qna getDetail(Long id) {
    Optional<Qna> qna = qnaRepository.findById(id);
    if (qna.isPresent()) {
      return qna.get();

    } else {
      throw new DataNotFoundException("질문을 찾을 수 없습니다.");
    }
  }

  // 질문 등록할때
  public void create(String title, String question, Users users, Course course) {
    Qna q = new Qna();
    q.setTitle(title);
    q.setQuestion(question);
    q.setUsers(users); // 작성 누가했는가
    q.setCourse(course); // 어떤 강좌인가?
    q.setStatus(QnaStatus.WAIT); // 질문 상태 default WAIT
    q.setCreatedAt(LocalDateTime.now());
    qnaRepository.save(q);
  }

}
