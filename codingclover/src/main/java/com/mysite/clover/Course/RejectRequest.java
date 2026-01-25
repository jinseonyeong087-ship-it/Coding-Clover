package com.mysite.clover.Course;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
// 관리자가 강좌를 반려할 때 사용하는 요청 DTO
public class RejectRequest {
    // 반려 사유 (왜 반려되었는지에 대한 설명)
    private String reason;
}
