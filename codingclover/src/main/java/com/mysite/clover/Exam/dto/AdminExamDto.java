package com.mysite.clover.Exam.dto;

import com.mysite.clover.Exam.Exam;
import lombok.Getter;
import lombok.AllArgsConstructor;
import java.util.List;

@Getter
@AllArgsConstructor
public class AdminExamDto {
    private Long examId;
    private Long courseId;
    private String courseTitle;
    private String instructorName; // 강사 이름 추가
    private String title;
    private Integer timeLimit;
    private Integer level;
    private Integer passScore;
    private List<ExamQuestionDto> questions;

    public static AdminExamDto fromEntity(Exam exam) {
        List<ExamQuestionDto> questionDtos = exam.getQuestions().stream()
                .map(q -> {
                    ExamQuestionDto dto = new ExamQuestionDto();
                    dto.setQuestionText(q.getQuestionText());
                    dto.setOption1(q.getOption1());
                    dto.setOption2(q.getOption2());
                    dto.setOption3(q.getOption3());
                    dto.setOption4(q.getOption4());
                    dto.setOption5(q.getOption5());
                    dto.setCorrectAnswer(q.getCorrectAnswer());
                    return dto;
                })
                .toList();

        return new AdminExamDto(
                exam.getExamId(),
                exam.getCourse().getCourseId(),
                exam.getCourse().getTitle(),
                exam.getCreatedBy().getName(), // 강사 이름
                exam.getTitle(),
                exam.getTimeLimit(),
                exam.getLevel(),
                exam.getPassScore(),
                questionDtos);
    }
}
