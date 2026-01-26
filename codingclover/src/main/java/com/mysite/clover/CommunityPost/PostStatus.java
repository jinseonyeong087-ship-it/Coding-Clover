package com.mysite.clover.CommunityPost;

/**
 * 게시글 상태를 정의하는 열거형
 * VISIBLE: 공개
 * HIDDEN: 숨김 (삭제 시 실제 데이터 삭제 대신 이 상태로 변경)
 */
public enum PostStatus {
  VISIBLE,
  HIDDEN
}
