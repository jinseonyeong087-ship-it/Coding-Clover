package com.mysite.clover.Qna;

import java.time.LocalDateTime;

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
  }
}
