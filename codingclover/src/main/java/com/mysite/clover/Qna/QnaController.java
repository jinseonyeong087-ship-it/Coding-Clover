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
import com.mysite.clover.QnaAnswer.QnaAnswerService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
public class QnaController {
  private final QnaService qnaService;
  private final UsersRepository usersRepository;
  private final CourseRepository courseRepository;
  private final QnaAnswerService qnaAnswerService;

  // 학생
  // =================================================================================
  @GetMapping("/student/qna")
  public List<QnaDto> getStudentList() {
    return qnaService.getList().stream()
        .map(QnaDto::new)
        .toList();
  }

  @GetMapping("/student/qna/my")
  public List<QnaDto> getMyList(@RequestParam("userId") Long userId) {
    // 유저 찾는거
    Users user = usersRepository.findById(userId).get();
    // 유저가 작성한 글만 가져오기
    return qnaService.getMyList(user).stream()
        .map(QnaDto::new)
        .toList();
  }

  // 질문 상세 보기
  @GetMapping("/student/qna/{id}")
  public QnaDto getDetail(@PathVariable("id") Long id) {
    Qna qna = qnaService.getDetail(id);
    return new QnaDto(qna);
  }

  // 질문 등록에 담을거(DTO)
  @Data
  public static class QnaAddRequest {
    private String title;
    private String question;
    private Long userId;
    private Long courseId;
  }

  // 질문 등록
  @PostMapping("/student/qna/add")
  public void createQna(@RequestBody QnaAddRequest request) {

    Users user = usersRepository.findById(request.getUserId()).get();
    Course course = courseRepository.findById(request.getCourseId()).get();

    qnaService.create(request.getTitle(), request.getQuestion(), user, course);

  }
  // =================================================================================

  // 강사
  // =================================================================================

  // Qna 전체 보기 (강사)
  @GetMapping("/instructor/qna")
  public List<QnaDto> getInstructorList() {
    return qnaService.getList().stream()
        .map(QnaDto::new)
        .toList();
  }

  // 강사 개인 강좌에 대한 질문 조회
  @GetMapping("/instructor/qna/{id}/owned")
  public List<QnaDto> getOwnedQna(@PathVariable("id") Long courseId) {
    Course course = courseRepository.findById(courseId).get();
    return qnaService.getCourseList(course).stream()
        .map(QnaDto::new)
        .toList();
  }

  // 답변 등록 DTO
  @Data
  public static class AnswerCreateRequest {
    private Long instructorId; // 답변하는 강사 ID
    private String content; // 답변 내용
  }

  // 답변 등록
  @PostMapping("/instructor/qna/{id}/add")
  public void createAnswer(@PathVariable("id") Long qnaId, @RequestBody AnswerCreateRequest request) {
    Qna qna = qnaService.getDetail(qnaId);
    Users instructor = usersRepository.findById(request.getInstructorId()).get();

    qnaAnswerService.create(qna, instructor, request.getContent());
  }
}