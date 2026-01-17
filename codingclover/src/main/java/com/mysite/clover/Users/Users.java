package com.mysite.clover.Users;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name="users")
public class Users {

	
    @Id // PK
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AI
    @Column(name = "user_id")
    private long userId;
    
    // 로그인 ID
    @Column(name = "login_id", length = 50, nullable = false , unique = true)
	private String loginId;
    
    // 비밀번호
    @Column(name = "password", length = 255, nullable = false)
    private String password;
    
    // 사용자 이름
    @Column(name = "name", length = 50, nullable = false)
    private String name;
    
    // 이메일
    @Column(name ="email", length = 100, nullable = false, unique = true)
    private String email;
    
    // 사용자 역할
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UsersRole role;
    
    // 계정 상태
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UsersStatus status;
    
    // 가입일
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // 수정일
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
}
