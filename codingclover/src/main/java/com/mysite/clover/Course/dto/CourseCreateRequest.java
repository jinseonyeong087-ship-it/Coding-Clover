package com.mysite.clover.Course.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

// 강사가 새로운 강좌를 개설하거나 기존 강좌를 수정할 때 사용하는 요청 DTO
@Getter
@Setter
public class CourseCreateRequest {

    // 강좌 제목 (빈 값이나 공백만 허용하지 않음)
    @NotBlank(message = "강좌 제목은 필수입니다.")
    private String title;

    // 강좌 상세 설명 (필수 입력)
    @NotBlank(message = "강좌 설명은 필수입니다.")
    private String description;

    // 난이도 (숫자로 입력, 1:초급 2:중급 3:고급 등, null 불가)
    @NotNull(message = "난이도를 선택해주세요.")
    private Integer level;

    // 수강료 (0원 이상이어야 함)
    @NotNull(message = "가격을 입력해주세요.")
    @Min(value = 0, message = "가격은 0원 이상이어야 합니다.")
    private Integer price;

    // 썸네일 이미지의 URL (선택 사항일 수 있지만 UI상 필수라면 프론트에서 필수로 체크)
    private String thumbnailUrl;

    // 프론트엔드에서 전달하는 강사 ID (보안상 실제 로직에서는 Principal을 사용해 검증하므로 참고용)
    private Long instructorId;
}
