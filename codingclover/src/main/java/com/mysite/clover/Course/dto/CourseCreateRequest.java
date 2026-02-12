package com.mysite.clover.Course.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

// 강좌 생성/수정 요청 DTO
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

    private String thumbnailUrl;
}
