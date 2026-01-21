package com.mysite.clover.Problem;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
  List<TestCase> findByProblem(Problem problem);
}
