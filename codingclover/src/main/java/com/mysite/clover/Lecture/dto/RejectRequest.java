package com.mysite.clover.Lecture.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// 반려 사유 요청 DTO
@Getter
@Setter
@AllArgsConstructor
public class RejectRequest {
    private String reason;
}
