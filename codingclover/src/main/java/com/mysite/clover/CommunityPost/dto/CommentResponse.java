package com.mysite.clover.CommunityPost.dto;

import com.mysite.clover.CommunityPost.CommunityComment;
import com.mysite.clover.CommunityPost.PostStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// 댓글 정보를 클라이언트로 응답할 때 사용하는 DTO
@Getter
@Setter
public class CommentResponse {

  // 댓글 고유 ID
  private Long id;

  // 댓글 내용
  private String content;

  // 댓글 상태 (VISIBLE, HIDDEN)
  private PostStatus status;

  // 작성자 이름 (사용자명)
  private String authorName;

  // 작성자 로그인 ID (아이디)
  private String authorId;

  // 작성일시
  private LocalDateTime createdAt;

  // 수정일시
  private LocalDateTime updatedAt;

  // 엔티티(CommunityComment)를 DTO(CommentResponse)로 변환하는 정적 메서드
  public static CommentResponse fromEntity(CommunityComment comment) {
    // 새로운 응답 객체 생성
    CommentResponse response = new CommentResponse();

    // 엔티티의 데이터를 DTO 필드에 복사
    response.setId(comment.getId()); // ID 설정
    response.setContent(comment.getContent()); // 내용 설정
    response.setStatus(comment.getStatus()); // 상태 설정

    // 작성자 정보 설정 (User 엔티티에서 이름과 로그인 ID 추출)
    response.setAuthorName(comment.getUser().getName()); // 작성자 이름
    response.setAuthorId(comment.getUser().getLoginId()); // 작성자 아이디

    // 시간 정보 설정
    response.setCreatedAt(comment.getCreatedAt()); // 작성일
    response.setUpdatedAt(comment.getUpdatedAt()); // 수정일

    // 변환된 객체 반환
    return response;
  }
}
