package com.mysite.clover.CommunityPost.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

// 댓글 생성 및 수정 요청 시 사용하는 요청 DTO
// 클라이언트로부터 댓글 내용을 전달받음
@Getter
@Setter
public class CommentRequest {

  // 댓글 내용
  // @NotBlank : 빈 값이나 공백만 있는 경우를 허용하지 않음 (유효성 검사)
  @NotBlank(message = "댓글 내용은 필수입니다.")
  private String content;
}
