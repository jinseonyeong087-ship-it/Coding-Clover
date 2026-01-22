package com.mysite.clover.Exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 시험 생성 요청 DTO
 * 강사가 새로운 시험을 출제할 때 전송하는 데이터입니다.
 */
@Getter
@AllArgsConstructor
public class ExamCreateRequest {
    /** 소속 강좌 ID */
    @NotNull(message = "강좌 ID는 필수입니다.")
    private Long courseId;

    /** 시험 제목 */
    @NotBlank(message = "시험 제목은 필수입니다.")
    private String title;

    /** 제한 시간 (분 단위) */
    @NotNull(message = "제한시간은 필수입니다.")
    private Integer timeLimit;

    /** 난이도 (1:초급, 2:중급, 3:고급) */
    @NotNull(message = "난이도는 필수입니다.")
    private Integer level;

    /** 합격 기준 점수 */
    @NotNull(message = "통과 기준 점수는 필수입니다.")
    private Integer passScore;
}
