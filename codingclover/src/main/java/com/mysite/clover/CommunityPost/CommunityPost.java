package com.mysite.clover.CommunityPost;

import com.mysite.clover.Users.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

// 커뮤니티 게시글 정보를 저장하는 엔티티
@Entity
@Getter
@Setter
@Table(name = "community_post")
public class CommunityPost {

    // 게시글 고유 식별자 (PK)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postId;

    // 작성자 정보 (Users 엔티티와 다대일 관계, 필수값)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    // 게시글 제목 (최대 200자, 필수값)
    @Column(length = 200, nullable = false)
    private String title;

    // 게시글 내용 (TEXT 타입으로 긴 내용 허용, 필수값)
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // 게시글 상태 (VISIBLE: 공개, HIDDEN: 숨김/삭제됨)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status = PostStatus.VISIBLE;

    // 게시글 생성 일시 (자동 생성)
    @CreationTimestamp
    private LocalDateTime createdAt;
}

// 게시글 상태를 정의하는 열거형 (공개/숨김)
enum PostStatus {
    VISIBLE, // 공개
    HIDDEN // 숨김 (삭제 시 실제 데이터 삭제 대신 이 상태로 변경)
}
