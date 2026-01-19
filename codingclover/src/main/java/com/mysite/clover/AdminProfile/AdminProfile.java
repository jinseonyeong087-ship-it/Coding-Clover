package com.mysite.clover.AdminProfile;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name="admin_profile")
public class AdminProfile {

  @Id // PK
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AI
    @Column(name = "user_id")
    private long userId;

  
  // 소속 부서
    @Column(name = "department", length = 50)
    private String department;
}
