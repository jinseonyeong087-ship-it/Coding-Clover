package com.mysite.clover.Lecture.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 강의 생성 요청 DTO
 * 강사가 새로운 강의를 업로드할 때 전송하는 데이터입니다.
 * 강의 제목, 순서, 비디오 URL 등 필수 정보를 포함하며, 유효성 검증을 위한 애노테이션이 적용됩니다.
 */
@Getter
@AllArgsConstructor
public class LectureCreateRequest {
    // 소속 강좌 ID
    @NotNull(message = "강좌 ID는 필수입니다.")
    private Long courseId;

    // 강의 제목
    @NotEmpty(message = "제목은 필수입니다.")
    private String title;

    // 강의 순서
    @NotNull(message = "순서는 필수입니다.")
    private Integer orderNo;

    // 영상 URL
    @NotEmpty(message = "영상 URL은 필수입니다.")
    private String videoUrl;

    // 영상 길이 (초 단위)
    @NotNull(message = "영상 길이는 필수입니다.")
    private Integer duration;
}
