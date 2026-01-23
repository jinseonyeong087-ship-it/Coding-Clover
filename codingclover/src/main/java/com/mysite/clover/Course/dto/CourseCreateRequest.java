package com.mysite.clover.Course.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;

/**
 * 강좌 생성 요청 DTO
 * 강사가 새로운 강좌를 개설할 때 전송하는 데이터입니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CourseCreateRequest {
    /** 강사 ID */
    private Long instructorId;

    /** 강좌 제목 */
    @NotEmpty(message = "제목은 필수입니다.")
    private String title;

    /** 강좌 설명 */
    @NotEmpty(message = "설명은 필수입니다.")
    private String description;

    /** 난이도 (1 이상) */
    @Min(value = 1, message = "레벨은 1 이상이어야 합니다.")
    private Integer level;

    /** 수강료 (0 이상) */
    @Min(value = 0, message = "가격은 0 이상이어야 합니다.")
    private Integer price;

    // private String thumbnailUrl; // 추후 추가
}
