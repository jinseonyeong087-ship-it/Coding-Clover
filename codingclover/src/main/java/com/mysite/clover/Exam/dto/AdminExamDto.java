package com.mysite.clover.Exam.dto;

import com.mysite.clover.Exam.Exam;
import lombok.Getter;
import java.util.List;

@Getter
public class AdminExamDto {
    private Long examId;
    private Long courseId;
    private String courseTitle;
    private String instructorName; // 강사 이름 추가
    private String title;
    private Integer timeLimit;
    private Integer level;
    private Integer courseLevel; // 강좌 난이도
    private Integer passScore;
    private java.time.LocalDateTime createdAt;
    private boolean isReuploaded;
    private List<ExamQuestionDto> questions;

    public static AdminExamDto fromEntity(Exam exam) {
        return fromEntity(exam, false);
    }

    public static AdminExamDto fromEntity(Exam exam, boolean isReuploaded) {
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
                exam.getCreatedBy().getName(),
                exam.getTitle(),
                exam.getTimeLimit(),
                exam.getLevel(),
                exam.getCourse().getLevel(), // 강좌 난이도
                exam.getPassScore(),
                null, // created_at not in DB, using null or we can omit
                isReuploaded,
                questionDtos);
    }

    public AdminExamDto(Long examId, Long courseId, String courseTitle, String instructorName, String title,
            Integer timeLimit, Integer level, Integer courseLevel, Integer passScore, java.time.LocalDateTime createdAt,
            boolean isReuploaded, List<ExamQuestionDto> questions) {
        this.examId = examId;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.instructorName = instructorName;
        this.title = title;
        this.timeLimit = timeLimit;
        this.level = level;
        this.courseLevel = courseLevel;
        this.passScore = passScore;
        this.createdAt = createdAt;
        this.isReuploaded = isReuploaded;
        this.questions = questions;
    }
}
