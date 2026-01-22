package com.mysite.clover.Qna;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;
import java.util.List;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import com.mysite.clover.QnaAnswer.QnaAnswer;

@Getter
@Setter
@Entity
@Table(name = "qna")
public class Qna {

  //qna_id
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "qna_id", nullable = false)
  private Long qnaId;

  //강좌 아이디
  @ManyToOne
  @JoinColumn(name = "course_id" , nullable = false)
  private Course course;

  // 유저 아이디
  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private Users users;

  // 제목
  @Column(name = "title", nullable = false)
  private String title;

  // 내용
  @Column(name = "question", nullable = false)
  private String question;

  // 상태
  @Column(name = "status", nullable = false)
  private QnaStatus status;

  // 생성일
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;
  
  @OneToMany(mappedBy = "qna", cascade = CascadeType.REMOVE)
  private List<QnaAnswer> qnaAnswerList;
}
