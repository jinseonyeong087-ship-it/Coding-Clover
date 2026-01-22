package com.mysite.clover.Exam.dto;

import com.mysite.clover.Exam.Exam;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 수강생용 시험 정보 DTO
 * 수강생이 응시 가능한 시험의 기본 정보를 담습니다.
 */
@Getter
@AllArgsConstructor
public class StudentExamDto {
    private Long examId;
    private Long courseId;
    private String title;
    private Integer timeLimit;
    private Integer level;
    private Integer passScore;

    /**
     * Entity -> DTO 변환 메서드
     * 
     * @param exam 시험 Entity
     * @return StudentExamDto
     */
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
