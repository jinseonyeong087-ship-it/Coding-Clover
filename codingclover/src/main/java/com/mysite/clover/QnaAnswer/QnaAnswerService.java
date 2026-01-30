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

  private final QnaAnswerRepository qnaAnswerRepository;
  private final QnaRepository qnaRepository;
  private final com.mysite.clover.Notification.NotificationService notificationService;

  public QnaAnswer getAnswer(Long answerId) {
    return qnaAnswerRepository.findById(answerId)
        .orElseThrow(() -> new RuntimeException("답변을 찾을 수 없습니다."));
  }

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

    // 질문 작성자(학생)에게 알림 전송
    notificationService.createNotification(
        qna.getUsers(),
        "QNA_ANSWERED",
        "작성하신 질문 '" + qna.getTitle() + "'에 답변이 달렸습니다.",
        "/course/" + qna.getCourse().getCourseId() + "/qna/" + qna.getQnaId());
  }

  public void update(QnaAnswer answer, String content) {
    answer.setAnswer(content);
    // 수정 시 시간을 갱신할지는 논의가 필요하나, 보통 생성일은 유지하고 수정일 필드를 따로 둡니다.
    // 현재는 수정일 필드가 없으므로 내용만 업데이트합니다.
    qnaAnswerRepository.save(answer);
  }

  public void delete(QnaAnswer answer) {
    Qna qna = answer.getQna();
    qnaAnswerRepository.delete(answer);

    // 만약 해당 질문에 다른 답변이 없다면 상태를 다시 PENDING으로 돌려야 할까요?
    // 질문의 답변 리스트를 체크해서 처리할 수 있습니다.
    if (qna.getQnaAnswerList().size() <= 1) { // 현재 삭제하려는게 마지막 답변인 경우
      qna.setStatus(QnaStatus.WAIT);
      qnaRepository.save(qna);
    }
  }
}
