package com.mysite.clover.Users;

/**
 * 계정 찾기 관련 통합 요청 DTO
 */
public class UsersFindRequest {

    // 아이디 찾기
    public record FindId(
        String name,
        String email
    ) {}

    // 비밀번호 찾기
    public record FindPw(
        String loginId,
        String name,
        String email
    ) {}
}