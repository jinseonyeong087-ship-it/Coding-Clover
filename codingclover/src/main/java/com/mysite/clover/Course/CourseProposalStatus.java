package com.mysite.clover.Course;

// 강좌의 승인 상태를 나타내는 열거형(Enum)
public enum CourseProposalStatus {
    // 승인 대기 중 (강사가 개설 요청 후 관리자가 아직 승인/반려하지 않은 상태)
    PENDING,

    // 승인됨 (관리자가 승인하여 일반 사용자들에게 공개된 상태)
    APPROVED,

    // 반려됨 (관리자가 승인을 거부한 상태, 반려 사유와 함께 관리됨)
    REJECTED,

    // 임시 저장 (작성 중인 상태)
    DRAFT
}
