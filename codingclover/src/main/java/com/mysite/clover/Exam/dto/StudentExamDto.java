package com.mysite.clover.Exam.dto;

import com.mysite.clover.Exam.Exam;

import lombok.AllArgsConstructor;
import lombok.Getter;

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

    // Exam 엔티티 -> StudentExamDto 변환 메서드
    public static StudentExamDto fromEntity(Exam exam) {
        return new StudentExamDto(
                exam.getExamId(),
                exam.getCourse().getCourseId(),
                exam.getTitle(),
                exam.getTimeLimit(),
                exam.getLevel(),
                exam.getPassScore());
    }
}
