package com.mysite.clover.Exam.dto;

import com.mysite.clover.Exam.Exam;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 관리자용 시험 정보 DTO
 * 시스템 전체 현황 파악을 위해 설계된 DTO입니다.
 * 시험의 기본 정보뿐만 아니라 소속 강좌명, 출제자 이름 등 관리자가 필요로 하는 확장된 정보를 포함합니다.
 */
@Getter
@AllArgsConstructor
public class AdminExamDto {
    private Long examId;
    private Long courseId;
    private String courseName;
    private String title;
    private Integer timeLimit;
    private Integer level;
    private Integer passScore;
    private String createdByName;

    /**
     * Entity -> DTO 변환 메서드
     * 
     * @param exam 시험 Entity
     * @return AdminExamDto
     */
    public static AdminExamDto fromEntity(Exam exam) {
        return new AdminExamDto(
                exam.getExamId(),
                exam.getCourse().getCourseId(),
                exam.getCourse().getTitle(),
                exam.getTitle(),
                exam.getTimeLimit(),
                exam.getLevel(),
                exam.getPassScore(),
                exam.getCreatedBy() != null ? exam.getCreatedBy().getName() : "Unknown");
    }
}
