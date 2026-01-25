package com.mysite.clover.Exam.dto;

import com.mysite.clover.Exam.Exam;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 강사용 시험 정보 DTO
 * 강사가 본인의 시험 목록을 관리할 때 사용하는 DTO입니다.
 * 시험 수정 및 관리에 필요한 핵심 데이터를 담고 있습니다.
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
