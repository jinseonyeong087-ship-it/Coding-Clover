package com.mysite.clover.Course.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * 강좌 생성 요청 DTO
 * 강사가 새로운 강좌를 개설하거나 수정할 때 제출하는 데이터입니다.
 * 제목, 설명, 난이도, 가격 등의 필수 정보를 포함하며 유효성 검사를 위한 애노테이션이 적용되어 있습니다.
 */
@Getter
@Setter
public class CourseCreateRequest {
    @NotBlank(message = "강좌 제목은 필수입니다.")
    private String title;

    @NotBlank(message = "강좌 설명은 필수입니다.")
    private String description;

    @NotNull(message = "난이도를 선택해주세요.")
    private Integer level;

    @NotNull(message = "가격을 입력해주세요.")
    @Min(value = 0, message = "가격은 0원 이상이어야 합니다.")
    private Integer price;

    private Long instructorId; // 프론트에서 보낸 ID를 담는 곳
}