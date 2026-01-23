package com.mysite.clover.QnaAnswer;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.mysite.clover.Qna.Qna;
import com.mysite.clover.Qna.QnaRepository;
import com.mysite.clover.Qna.QnaStatus;
import com.mysite.clover.Users.Users;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class QnaAnswerService {

  private final QnaAnswerRopository qnaAnswerRepository;
  private final QnaRepository qnaRepository;

  public void create(Qna qna, Users instructor, String answerContent) {
    QnaAnswer qnaAnswer = new QnaAnswer();
    qnaAnswer.setQna(qna);
    qnaAnswer.setInstructor(instructor);
    qnaAnswer.setAnswer(answerContent);
    qnaAnswer.setAnsweredAt(LocalDateTime.now());

    qnaAnswerRepository.save(qnaAnswer);

    // 질문 상태를 답변 완료(ANSWERED)로 변경
    qna.setStatus(QnaStatus.ANSWERED);
    qnaRepository.save(qna);
  }
}
