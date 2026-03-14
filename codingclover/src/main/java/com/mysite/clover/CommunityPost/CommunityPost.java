package com.mysite.clover.CommunityPost;

import com.mysite.clover.Users.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;

// 커뮤니티 게시글 엔티티
@Entity
@Getter
@Setter
@Table(name = "community_post")
public class CommunityPost {

    // 게시글 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postId;

    // 작성자 정보
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    // 제목
    @Column(length = 200, nullable = false)
    private String title;

    // 내용
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // 게시글 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status = PostStatus.VISIBLE;

    // 생성일
    @CreationTimestamp
    private LocalDateTime createdAt;

    // 댓글 목록
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommunityComment> comments;
}
