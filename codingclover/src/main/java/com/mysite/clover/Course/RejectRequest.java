package com.mysite.clover.Course;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
// 강좌 반려 요청 DTO
public class RejectRequest {
    // 반려 사유
    private String reason;
}