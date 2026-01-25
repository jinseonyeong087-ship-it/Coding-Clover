package com.mysite.clover.Exam.dto;

import com.mysite.clover.Exam.Exam;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 관리자가 시험 정보를 조회(확인)할 때 사용하는 DTO
@Getter
@AllArgsConstructor
public class AdminExamDto {
    private Long examId; // 시험 ID
    private Long courseId; // 소속 강좌 ID
    private String courseName; // 소속 강좌 제목 (가독성을 위해 추가)
    private String title; // 시험 제목
    private Integer timeLimit; // 제한 시간(분)
    private Integer level; // 난이도
    private Integer passScore; // 합격 기준 점수
    private String createdByName; // 출제한 강사 이름

    // Exam 엔티티 -> AdminExamDto 변환 메서드
    public static AdminExamDto fromEntity(Exam exam) {
        return new AdminExamDto(
                exam.getExamId(),
                exam.getCourse().getCourseId(),
                exam.getCourse().getTitle(),
                exam.getTitle(),
                exam.getTimeLimit(),
                exam.getLevel(),
                exam.getPassScore(),
                // 출제자가 삭제되었을 경우 "Unknown" 처리
                exam.getCreatedBy() != null ? exam.getCreatedBy().getName() : "Unknown");
    }
}
