package com.mysite.clover.Exam.dto;

import com.mysite.clover.Exam.Exam;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

// 강사 본인이 출제한 시험 목록 등을 조회할 때 사용하는 DTO
@Getter
@AllArgsConstructor
public class InstructorExamDto {
    // 시험 ID
    private Long examId;
    // 소속 강좌 ID
    private Long courseId;
    // 소속 강좌 제목 (목록 표시용)
    private String courseTitle;
    // 시험 제목
    private String title;
    // 제한 시간(분)
    private Integer timeLimit;
    // 난이도
    private Integer level;
    // 합격 기준 점수
    private Integer passScore;
    // 시험 문제 리스트
    private List<ExamQuestionDto> questions;

    // Exam 엔티티 -> InstructorExamDto 변환 메서드
    public static InstructorExamDto fromEntity(Exam exam) {
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

        return new InstructorExamDto(
                exam.getExamId(),
                exam.getCourse().getCourseId(),
                exam.getCourse().getTitle(),
                exam.getTitle(),
                exam.getTimeLimit(),
                exam.getLevel(),
                exam.getPassScore(),
                questionDtos);
    }
}
