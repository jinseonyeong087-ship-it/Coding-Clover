package com.mysite.clover.Exam.dto;

import com.mysite.clover.Exam.Exam;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

// 수강생(학생)에게 보여주는 시험 정보 DTO
@Getter
@AllArgsConstructor
public class StudentExamDto {
    // 시험 ID
    private Long examId;
    // 소속 강좌 ID
    private Long courseId;
    // 시험 제목
    private String title;
    // 제한 시간(분)
    private Integer timeLimit;
    // 난이도
    private Integer level;
    // 합격 기준 점수
    private Integer passScore;
    // 소속 강좌 제목
    private String courseTitle;
    // 시험 문제 리스트 (정답 제외)
    private List<StudentExamQuestionDto> questions;

    // Exam 엔티티 -> StudentExamDto 변환 메서드
    public static StudentExamDto fromEntity(Exam exam) {
        List<StudentExamQuestionDto> questionDtos = exam.getQuestions().stream()
                .map(q -> {
                    StudentExamQuestionDto dto = new StudentExamQuestionDto();
                    dto.setQuestionId(q.getQuestionId());
                    dto.setQuestionText(q.getQuestionText());
                    dto.setOption1(q.getOption1());
                    dto.setOption2(q.getOption2());
                    dto.setOption3(q.getOption3());
                    dto.setOption4(q.getOption4());
                    dto.setOption5(q.getOption5());
                    return dto;
                })
                .toList();

        return new StudentExamDto(
                exam.getExamId(),
                exam.getCourse().getCourseId(),
                exam.getTitle(),
                exam.getTimeLimit(),
                exam.getCourse().getLevel(),
                exam.getPassScore(),
                exam.getCourse().getTitle(),
                questionDtos);
    }
}
