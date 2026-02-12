package com.mysite.clover.CommunityPost.dto;

import com.mysite.clover.CommunityPost.CommunityPost;
import com.mysite.clover.CommunityPost.PostStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

// 게시글 정보 응답 DTO
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

  // 댓글 수 (목록 조회 시 사용)
  private long commentCount;

  // 게시글에 달린 댓글 목록 (CommentResponse 리스트, 목록 조회 시 null)
  private List<CommentResponse> comments;

  // 엔티티(CommunityPost)를 DTO(PostResponse)로 변환하는 정적 메서드
  // includeComments: 댓글 목록 포함 여부
  // includeHiddenComments: 숨김 댓글 포함 여부 (관리자 전용)
  public static PostResponse fromEntity(CommunityPost post, boolean includeComments, boolean includeHiddenComments) {
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

    // 댓글 수 설정
    if (post.getComments() != null) {
      response.setCommentCount(post.getComments().size());
    }

    // 댓글 목록 변환 로직 (상세 조회 시에만 포함)
    if (includeComments && post.getComments() != null) {
      response.setComments(post.getComments().stream()
          .filter(comment -> includeHiddenComments || comment.getStatus() == PostStatus.VISIBLE)
          .map(CommentResponse::fromEntity)
          .collect(Collectors.toList()));
    }

    return response;
  }

  // 기존 호출부 호환용 (숨김 댓글 제외)
  public static PostResponse fromEntity(CommunityPost post, boolean includeComments) {
    return fromEntity(post, includeComments, false);
  }
}
