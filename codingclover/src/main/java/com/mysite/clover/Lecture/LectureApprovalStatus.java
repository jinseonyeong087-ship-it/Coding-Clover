package com.mysite.clover.Lecture;

// 강의 승인 상태 Enum
public enum LectureApprovalStatus {
    // 승인 대기 중
    PENDING,
    // 승인됨 (공개)
    APPROVED,
    // 반려됨
    REJECTED,
    // 비활성화됨 (삭제 등)
    INACTIVE
}
