package com.mysite.clover.Course;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
// 관리자가 강좌를 반려할 때 사용하는 요청 DTO
public class RejectRequest {
    // 반려 사유 (왜 반려되었는지에 대한 설명)
    private String reason;
}

// NoArgsConstructor를 사용하는 이유
// RejectRequest(객체)=@RequestBody(Json데이터 받는 애)로 지정돼있음
// (CourseController reject 부분 확인)
// Json으로 받아서 @RequestBody랑 짝짝꿍 하라고