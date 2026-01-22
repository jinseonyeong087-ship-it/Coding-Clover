package com.mysite.clover.QnaAnswer;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import java.time.LocalDateTime;
import com.mysite.clover.Qna.Qna;
import com.mysite.clover.Users.Users;

@Getter
@Setter
@Entity
@Table(name = "qna_answer")
public class QnaAnswer {

  //answer_id
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "answer_id", nullable = false)
  private Long answerId;

  //qna_id
  @ManyToOne
  @JoinColumn(name = "qna_id", nullable = false)
  private Qna qna;

  //강사 아이디
  @ManyToOne
  @JoinColumn(name = "instructor_id", nullable = false)
  private Users instructor;

  //답변
  @Column(name = "answer", nullable = false)
  private String answer;

  //생성일
  @Column(name = "answered_at", nullable = false)
  private LocalDateTime answeredAt;

  
}
