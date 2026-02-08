package com.mysite.clover.Exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

// 강사가 시험을 생성하거나 수정할 때 사용하는 요청 DTO
@Getter
@AllArgsConstructor
public class ExamCreateRequest {
    // 시험이 속할 강좌 ID (필수)
    @NotNull(message = "강좌 ID는 필수입니다.")
    private Long courseId;

    // 시험 제목 (필수)
    @NotBlank(message = "시험 제목은 필수입니다.")
    private String title;

    // 제한 시간 (분 단위, 필수)
    @NotNull(message = "제한시간은 필수입니다.")
    private Integer timeLimit;

    // 난이도 (1, 2, 3... - 필수)
    @NotNull(message = "난이도는 필수입니다.")
    private Integer level;

    // 합격 기준 점수 (100점 만점 기준 등 - 필수)
    @NotNull(message = "통과 기준 점수는 필수입니다.")
    private Integer passScore;

    // 시험 공개 여부 (체크하지 않으면 false = 비공개)
    private Boolean isPublished = false;

    // 시험 문제 리스트 (최소 1문제, 최대 20문제)
    @NotNull(message = "문제 리스트는 필수입니다.")
    @jakarta.validation.constraints.Size(min = 1, max = 20, message = "문제는 1개 이상 20개 이하로 등록해야 합니다.")
    private java.util.List<ExamQuestionDto> questions;
}
