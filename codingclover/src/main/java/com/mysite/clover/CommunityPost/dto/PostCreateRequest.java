package com.mysite.clover.CommunityPost.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

// 게시글 생성 및 수정 요청 시 사용하는 데이터 전송 객체 (DTO)
// 클라이언트가 보내는 JSON 데이터를 매핑받음
@Getter
@Setter
public class PostCreateRequest {

  // 게시글 제목
  // @NotBlank : null, "", " " 모두 허용하지 않음 (필수 입력값)
  @NotBlank(message = "제목은 필수항목입니다.")
  private String title;

  // 게시글 내용
  // @NotBlank : 필수 입력값
  @NotBlank(message = "내용은 필수항목입니다.")
  private String content;
}
