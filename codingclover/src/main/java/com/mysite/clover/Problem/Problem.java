package com.mysite.clover.Problem;

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
@Table(name = "problem")
public class Problem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "problem_id")
  private Long problemId;

  @Column(length = 100, nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(columnDefinition = "ENUM('EASY', 'MEDIUM', 'HARD') DEFAULT 'EASY'", nullable = false)
  private ProblemDifficulty difficulty;

  @Column(name = "created_at", nullable = false, updatable = false, insertable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
  private java.time.LocalDateTime createdAt;
}
