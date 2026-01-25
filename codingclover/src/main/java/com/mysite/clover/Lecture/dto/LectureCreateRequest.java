package com.mysite.clover.Lecture.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

// 강사가 강의를 업로드할 때 사용하는 요청 DTO
@Getter
@AllArgsConstructor
public class LectureCreateRequest {
    // 강의가 등록될 강좌의 ID (필수)
    @NotNull(message = "강좌 ID는 필수입니다.")
    private Long courseId;

    // 강의 제목 (필수)
    @NotEmpty(message = "제목은 필수입니다.")
    private String title;

    // 강의 순서 (1, 2, 3... - 필수)
    @NotNull(message = "순서는 필수입니다.")
    private Integer orderNo;

    // 강의 영상 URL (필수)
    @NotEmpty(message = "영상 URL은 필수입니다.")
    private String videoUrl;

    // 영상 재생 시간 (초 단위 - 필수)
    @NotNull(message = "영상 길이는 필수입니다.")
    private Integer duration;
}
