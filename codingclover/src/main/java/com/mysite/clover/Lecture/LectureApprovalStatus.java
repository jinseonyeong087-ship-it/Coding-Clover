package com.mysite.clover.Lecture;

// 개별 강의의 승인 상태를 나타내는 열거형(Enum)
public enum LectureApprovalStatus {
    // 승인 대기 중 (강사가 업로드 직후의 기본 상태)
    PENDING,

    // 승인됨 (관리자 승인 완료, 사용자들에게 공개됨)
    APPROVED,

    // 반려됨 (관리자가 내용을 검토하고 거부함)
    REJECTED,

    // 비활성화됨 (관리자 또는 강사에 의해 삭제되거나 숨겨진 상태)
    INACTIVE
}
