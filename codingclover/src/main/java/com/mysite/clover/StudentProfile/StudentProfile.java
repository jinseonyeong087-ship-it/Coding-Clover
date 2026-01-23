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
@Table(name="student_profile")
public class StudentProfile {
  
  @Id // PK
    @Column(name = "user_id")
    private Long userId;

  //1:1 Users와 매핑 - MapsId 제거
  @OneToOne
    @JoinColumn(name = "user_id")
    private Users user;

  //학습 수준
  @Column(name = "education_level", length = 50)
    private String educationLevel;

  //관심 분야
  @Column(name = "interest_category", length = 100)
    private String interestCategory;
    
  // 안전한 생성자
  public StudentProfile(Long userId) {
    this.userId = userId;
  }
}
