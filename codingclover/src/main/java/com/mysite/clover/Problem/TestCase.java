package com.mysite.clover.Problem;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "test_case")
public class TestCase {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "test_case_id")
  private Long testCaseId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "problem_id")
  private Problem problem;

  @Column(name = "input_data", columnDefinition = "TEXT", nullable = false)
  private String inputData;

  @Column(name = "expected_output", columnDefinition = "TEXT", nullable = false)
  private String expectedOutput;
}
