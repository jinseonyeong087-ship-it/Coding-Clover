package com.mysite.clover.StudentProfile;

import com.mysite.clover.Users.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.Table;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "student_profile")
public class StudentProfile {

  @Id // PK(DB 식별자 정의)
  @Column(name = "user_id")
  private Long userId;

  // 1:1 Users와 매핑(엔티티 연관관계 정의)
  @OneToOne
  @JoinColumn(name = "user_id")
  private Users user;

  // PK(user_id) 없이 생성되는 것을 방지(객체 생성 규칙)
  public StudentProfile(Long userId) {
    this.userId = userId;
  }

  // 학습 수준
  @Column(name = "education_level", length = 50)
  private String educationLevel;

  // 관심 분야
  @Column(name = "interest_category", length = 100)
  private String interestCategory;

}
