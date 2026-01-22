package com.mysite.clover.Qna;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.mysite.clover.Course.Course;
import com.mysite.clover.Course.CourseRepository;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
public class QnaController {
  private final QnaService qnaService;
  private final UsersRepository usersRepository;
  private final CourseRepository courseRepository;

  @GetMapping("/student/qna")
  public List<Qna> getStudentList() {
    return qnaService.getList();
  }

  @GetMapping("/student/qna/my")
  public List<Qna> getMyList(@RequestParam("userId") Long userId) {

    // 유저 찾는거
    Users user = usersRepository.findById(userId).get();

    // 유저가 작성한 글만 가져오기
    return qnaService.getMyList(user);
  }

  // 질문 상세 보기
  @GetMapping("/student/qna/{id}")
  public Qna getDetail(@PathVariable("id") Long id) {
    return qnaService.getDetail(id);
  }

  // 질문 등록
  @Data
  public static class QnaAddRequest {
    private String title;
    private String question;
    private Long userId;
    private Long courseId;
  }

  @PostMapping("/student/qna/add")
  public void createQna(@RequestBody QnaAddRequest request) {

    Users user = usersRepository.findById(request.getUserId()).get();
    Course course = courseRepository.findById(request.getCourseId()).get();

    qnaService.create(request.getTitle(), request.getQuestion(), user, course);

  }
}