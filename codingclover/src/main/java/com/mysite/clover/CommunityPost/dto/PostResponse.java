package com.mysite.clover.CommunityPost.dto;

import com.mysite.clover.CommunityPost.CommunityPost;
import com.mysite.clover.CommunityPost.PostStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

// 게시글 상세 정보를 클라이언트로 응답할 때 사용하는 DTO
// 게시글 정보뿐만 아니라 연관된 댓글 목록도 포함하여 전달
@Getter
@Setter
public class PostResponse {

  // 게시글 ID
  private Long id;

  // 게시글 제목
  private String title;

  // 게시글 내용
  private String content;

  // 작성자 이름
  private String authorName;

  // 작성자 로그인 ID
  private String authorId;

  // 게시글 상태 (VISIBLE, HIDDEN)
  private PostStatus status;

  // 작성일시
  private LocalDateTime createdAt;

  // 게시글에 달린 댓글 목록 (CommentResponse 리스트)
  private List<CommentResponse> comments;

  // 엔티티(CommunityPost)를 DTO(PostResponse)로 변환하는 정적 메서드
  public static PostResponse fromEntity(CommunityPost post) {
    // 응답 객체 생성
    PostResponse response = new PostResponse();

    // 기본 정보 매핑
    response.setId(post.getPostId()); // ID 복사
    response.setTitle(post.getTitle()); // 제목 복사
    response.setContent(post.getContent()); // 내용 복사

    // 작성자 정보가 존재할 경우에만 매핑 (Null Safety)
    if (post.getUser() != null) {
      response.setAuthorName(post.getUser().getName()); // 작성자 이름
      response.setAuthorId(post.getUser().getLoginId()); // 작성자 아이디
    }

    // 상태 및 시간 정보 매핑
    response.setStatus(post.getStatus());
    response.setCreatedAt(post.getCreatedAt());

    // 댓글 목록 변환 로직
    if (post.getComments() != null) {
      // 댓글 엔티티 리스트를 스트림으로 변환하여 순회
      response.setComments(post.getComments().stream()
          // 각 댓글 엔티티(CommunityComment)를 DTO(CommentResponse)로 변환
          .map(CommentResponse::fromEntity)
          // 변환된 DTO들을 리스트로 수집하여 설정
          .collect(Collectors.toList()));
    }

    // 완성된 DTO 반환
    return response;
  }
}
