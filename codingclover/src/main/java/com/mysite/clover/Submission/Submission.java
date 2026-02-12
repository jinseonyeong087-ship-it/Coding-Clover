package com.mysite.clover.Submission;

import java.time.LocalDateTime;

import com.mysite.clover.Problem.Problem;
import com.mysite.clover.Users.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.AccessLevel;

@Getter
@Setter
@Entity
@Table(name = "submission")
public class Submission {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "submission_id")
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private Users users;

  @ManyToOne
  @JoinColumn(name = "problem_id", nullable = false)
  private Problem problem;

  // Shadow column to satisfy DB schema drift
  @Column(name = "source_code", columnDefinition = "TEXT", nullable = false)
  private String sourceCode;

  // Getter for backward compatibility
  public String getCode() {
    return this.sourceCode;
  }

  // Setter for backward compatibility  
  public void setCode(String code) {
    this.sourceCode = code;
  }

  // PASS, FAIL, ERROR
  @Column(nullable = false)
  private String status;

  @Column(name = "execution_time")
  private Long executionTime;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;
}
