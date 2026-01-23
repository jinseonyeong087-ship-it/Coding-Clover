package com.mysite.clover.Qna;

import java.time.LocalDateTime;

import java.util.List;
import com.mysite.clover.QnaAnswer.QnaAnswer;
import lombok.Data;

@Data
public class QnaDto {
  private Long qnaId;
  private String title;
  private String question;
  private String status;
  private LocalDateTime createdAt;

  // User info
  private Long userId;
  private String userName; // 작성자 이름

  // Course info
  private Long courseId;
  private String courseTitle;

  // Answers
  private List<QnaAnswerDto> answers;

  public QnaDto(Qna qna) {
    qnaId = qna.getQnaId();
    title = qna.getTitle();
    question = qna.getQuestion();
    status = qna.getStatus().toString();
    createdAt = qna.getCreatedAt();

    // User info
    userId = qna.getUsers().getUserId();
    userName = qna.getUsers().getName();

    // Course info
    courseId = qna.getCourse().getCourseId();
    courseTitle = qna.getCourse().getTitle();

    // Answers
    if (qna.getQnaAnswerList() != null) {
      this.answers = qna.getQnaAnswerList().stream()
          .map(QnaAnswerDto::new)
          .toList();
    }
  }

  @Data
  public static class QnaAnswerDto {
    private Long answerId;
    private String content;
    private Long instructorId;
    private String instructorName;
    private LocalDateTime answeredAt;

    public QnaAnswerDto(QnaAnswer answer) {
      this.answerId = answer.getAnswerId();
      this.content = answer.getAnswer();
      this.instructorId = answer.getInstructor().getUserId();
      this.instructorName = answer.getInstructor().getName();
      this.answeredAt = answer.getAnsweredAt();
    }
  }
}
