package com.mysite.clover.Exam.dto;

import com.mysite.clover.Exam.Exam;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 강사 본인이 출제한 시험 목록 등을 조회할 때 사용하는 DTO
@Getter
@AllArgsConstructor
public class InstructorExamDto {
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

    // Exam 엔티티 -> InstructorExamDto 변환 메서드
    public static InstructorExamDto fromEntity(Exam exam) {
        return new InstructorExamDto(
                exam.getExamId(),
                exam.getCourse().getCourseId(),
                exam.getTitle(),
                exam.getTimeLimit(),
                exam.getLevel(),
                exam.getPassScore());
    }
}
