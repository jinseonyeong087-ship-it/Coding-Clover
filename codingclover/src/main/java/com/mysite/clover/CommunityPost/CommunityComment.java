package com.mysite.clover.CommunityPost;

import com.mysite.clover.Users.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

// 커뮤니티 댓글 엔티티
@Entity
@Getter
@Setter
@Table(name = "community_comment")
public class CommunityComment {

  // 댓글 ID
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // 댓글 내용
  @Column(columnDefinition = "TEXT", nullable = false)
  private String content;

  // 댓글 상태
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PostStatus status = PostStatus.VISIBLE;

  // 연결된 게시글
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "post_id", nullable = false)
  private CommunityPost post;

  // 작성자 정보
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private Users user;

  // 생성일
  @CreationTimestamp
  private LocalDateTime createdAt;

  // 수정일
  @UpdateTimestamp
  private LocalDateTime updatedAt;
}
