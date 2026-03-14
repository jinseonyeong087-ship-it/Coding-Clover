package com.mysite.clover.Submission;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mysite.clover.Problem.Problem;
import com.mysite.clover.Users.Users;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
  List<Submission> findByUsers(Users users);

  List<Submission> findByProblem(Problem problem);

  List<Submission> findByUsersAndProblem(Users users, Problem problem);
}
