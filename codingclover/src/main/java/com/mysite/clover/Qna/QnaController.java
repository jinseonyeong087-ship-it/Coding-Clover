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
import com.mysite.clover.QnaAnswer.QnaAnswer;
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

  // 질문 수정 DTO
  @Data
  public static class QnaUpdateRequest {
    private String title;
    private String question;
    private Long userId; // 수정을 요청하는 유저 ID
  }

  // 질문 수정
  @PostMapping("/student/qna/{id}/update")
  public void updateQna(@PathVariable("id") Long qnaId, @RequestBody QnaUpdateRequest request) {
    Qna qna = qnaService.getDetail(qnaId);

    // 권한 체크: 질문 작성자 본인만 가능
    if (qna.getUsers().getUserId() != request.getUserId()) {
      throw new RuntimeException("수정 권한이 없습니다.");
    }

    qnaService.update(qna, request.getTitle(), request.getQuestion());
  }

  // 질문 삭제 DTO
  @Data
  public static class QnaDeleteRequest {
    private Long userId; // 삭제를 요청하는 유저 ID
  }

  // 질문 삭제
  @PostMapping("/student/qna/{id}/delete")
  public void deleteQna(@PathVariable("id") Long qnaId, @RequestBody QnaDeleteRequest request) {
    Qna qna = qnaService.getDetail(qnaId);
    Users user = usersRepository.findById(request.getUserId()).get();

    // 권한 체크: 작성자 본인이거나 관리자
    boolean isOwner = qna.getUsers().getUserId() == request.getUserId();
    boolean isAdmin = user.getRole() == com.mysite.clover.Users.UsersRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new RuntimeException("삭제 권한이 없습니다.");
    }

    qnaService.delete(qna);
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

  // 답변 수정 DTO
  @Data
  public static class AnswerUpdateRequest {
    private Long userId; // 수정하려는 유저 ID
    private String content; // 수정할 내용
  }

  // 답변 수정
  @PostMapping("/instructor/qna/answer/{id}/update")
  public void updateAnswer(@PathVariable("id") Long answerId, @RequestBody AnswerUpdateRequest request) {
    QnaAnswer answer = qnaAnswerService.getAnswer(answerId);

    // 권한 체크: 답변 작성자 본인만 가능
    if (answer.getInstructor().getUserId() != request.getUserId()) {
      throw new RuntimeException("수정 권한이 없습니다.");
    }

    qnaAnswerService.update(answer, request.getContent());
  }

  // 답변 삭제 DTO
  @Data
  public static class AnswerDeleteRequest {
    private Long userId; // 삭제하려는 유저 ID
  }

  // 답변 삭제
  @PostMapping("/instructor/qna/answer/{id}/delete")
  public void deleteAnswer(@PathVariable("id") Long answerId, @RequestBody AnswerDeleteRequest request) {
    QnaAnswer answer = qnaAnswerService.getAnswer(answerId);
    Users user = usersRepository.findById(request.getUserId()).get();

    // 권한 체크: 답변 작성자 본인이거나 관리자(ADMIN)여야 함
    boolean isOwner = answer.getInstructor().getUserId() == request.getUserId();
    boolean isAdmin = user.getRole() == com.mysite.clover.Users.UsersRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new RuntimeException("삭제 권한이 없습니다.");
    }

    qnaAnswerService.delete(answer);
  }
}