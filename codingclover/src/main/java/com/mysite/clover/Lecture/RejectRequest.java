package com.mysite.clover.Lecture;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 반려 사유 요청 DTO
@Getter
@AllArgsConstructor
public class RejectRequest {
    private String reason;
}
