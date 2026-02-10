package com.mysite.clover.CommunityPost;

import com.mysite.clover.Users.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

// 커뮤니티 게시글에 달리는 댓글 엔티티
@Entity
@Getter
@Setter
@Table(name = "community_comment")
public class CommunityComment {

  // 댓글 고유 식별자 (PK)
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // 댓글 내용 (TEXT 타입, 필수)
  @Column(columnDefinition = "TEXT", nullable = false)
  private String content;

  // 댓글 상태 (VISIBLE: 공개, HIDDEN: 숨김)
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PostStatus status = PostStatus.VISIBLE;

  // 해당 댓글이 속한 게시글 정보 (다대일 관계, 필수)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "post_id", nullable = false)
  private CommunityPost post;

  // 댓글 작성자 정보 (다대일 관계, 필수)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private Users user;

  // 댓글 생성 일시 (자동 생성)
  @CreationTimestamp
  private LocalDateTime createdAt;

  // 댓글 수정 일시 (자동 갱신)
  @UpdateTimestamp
  private LocalDateTime updatedAt;
}
