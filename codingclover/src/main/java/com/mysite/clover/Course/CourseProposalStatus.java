package com.mysite.clover.Course;

/**
 * 강좌 승인 상태 Enum
 */
public enum CourseProposalStatus {
    /** 승인 대기 중 */
    PENDING,
    /** 승인됨 (공개) */
    APPROVED,
    /** 반려됨 */
    REJECTED
}
