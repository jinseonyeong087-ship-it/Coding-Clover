package com.mysite.clover.CommunityPost.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

// 댓글 생성 및 수정 요청 시 사용하는 요청 DTO
@Getter
@Setter
public class CommentRequest {

  // 댓글 내용
  @NotBlank(message = "댓글 내용은 필수입니다.")
  private String content;
}
