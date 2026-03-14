package com.mysite.clover.Course;

// 강좌 승인 상태
public enum CourseProposalStatus {
    PENDING, // 승인 대기
    APPROVED, // 승인 완료
    REJECTED, // 반려됨
    DRAFT // 임시 저장
}
