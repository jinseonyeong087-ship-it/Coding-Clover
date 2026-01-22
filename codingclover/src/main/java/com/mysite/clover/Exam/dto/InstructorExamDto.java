package com.mysite.clover.Exam.dto;

import com.mysite.clover.Exam.Exam;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 강사용 시험 정보 DTO
 * 강사가 출제한 시험의 정보를 담습니다.
 */
@Getter
@AllArgsConstructor
public class InstructorExamDto {
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
     * @return InstructorExamDto
     */
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
