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

  // 조회수
  // 댓글 수 (목록 조회 시 사용)
  private long commentCount;

  // 게시글에 달린 댓글 목록 (CommentResponse 리스트, 목록 조회 시 null)
  private List<CommentResponse> comments;

  // 엔티티(CommunityPost)를 DTO(PostResponse)로 변환하는 정적 메서드
  // includeComments: 댓글 목록 포함 여부
  public static PostResponse fromEntity(CommunityPost post, boolean includeComments) {
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

    // 댓글 수 설정 (지연 로딩 주의: BatchSize 혹은 Fetch Join 필요하지만, 일단 리스트 사이즈로)
    // 리스트 조회 시에는 size() 호출이 쿼리를 유발할 수 있으므로 주의해야 함.
    // 하지만 현재 구조상 comments 필드 접근 시 proxy 초기화됨.
    if (post.getComments() != null) {
      response.setCommentCount(post.getComments().size());
    }

    // 댓글 목록 변환 로직 (상세 조회 시에만 포함)
    if (includeComments && post.getComments() != null) {
      response.setComments(post.getComments().stream()
          .map(CommentResponse::fromEntity)
          .collect(Collectors.toList()));
    }

    return response;
  }
}
