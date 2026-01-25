// src/main/java/com/mysite/clover/CommunityPost/CommunityPost.java
package com.mysite.clover.CommunityPost;

import com.mysite.clover.Users.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

/**
 * 커뮤니티 게시글 엔티티
 * 사용자 간의 소통을 위한 게시글 정보를 저장합니다.
 * 작성자(User), 제목, 내용, 공개 상태 등을 관리합니다.
 */
@Entity
@Getter
@Setter
@Table(name = "community_post")
public class CommunityPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user; // 작성자

    @Column(length = 200, nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status = PostStatus.VISIBLE;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

// PostStatus.java (같은 패키지 혹은 별도 파일)
enum PostStatus {
    VISIBLE, HIDDEN
}