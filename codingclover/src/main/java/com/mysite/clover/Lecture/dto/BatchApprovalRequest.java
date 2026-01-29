package com.mysite.clover.Lecture.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BatchApprovalRequest {
    private List<Long> lectureIds; // 선택된 강의 ID 리스트
    private String rejectReason;   // 반려 시에만 사용될 사유
}
