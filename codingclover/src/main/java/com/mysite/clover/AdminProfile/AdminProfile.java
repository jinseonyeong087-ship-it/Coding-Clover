package com.mysite.clover.AdminProfile;

import com.mysite.clover.Users.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name="admin_profile")
public class AdminProfile {

  @Id // PK
    @Column(name = "user_id")
    private Long userId;

  //1:1 Users와 매핑
  @OneToOne
    @MapsId  // userId를 Users의 PK와 매핑
    @JoinColumn(name = "user_id")
    private Users user;

  
  // 소속 부서
    @Column(name = "department", length = 50)
    private String department;
}
