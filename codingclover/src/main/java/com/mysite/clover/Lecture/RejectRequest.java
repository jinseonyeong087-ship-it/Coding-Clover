package com.mysite.clover.Lecture;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 반려 사유 요청 DTO
 * 관리자가 강의나 강좌를 승인 거부(반려)할 때, 그 사유를 전달하기 위해 사용됩니다.
 */
@Getter
@AllArgsConstructor
public class RejectRequest {
    private String reason;
}
