package com.mysite.clover.Exam.dto;

import com.mysite.clover.Exam.Exam;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 수강생용 시험 정보 DTO
 * 수강생이 강좌 학습 후 응시할 시험의 정보를 제공합니다.
 * 시험 응시에 필요한 최소한의 정보(제목, 시간, 난이도 등)만 노출합니다.
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
