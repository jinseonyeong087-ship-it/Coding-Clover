package com.mysite.clover.Users;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ApiLoginSuccess extends SimpleUrlAuthenticationSuccessHandler {

  private final ObjectMapper objectMapper;
  private final UsersRepository usersRepository;

  @Override
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
      Authentication authentication) throws IOException, ServletException {

    String loginId = authentication.getName();
    Users user = usersRepository.findByLoginId(loginId).orElseThrow(() -> new RuntimeException("User not found"));

    response.setStatus(HttpServletResponse.SC_OK);
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());

    // 프론트엔드가 원하는 사용자 정보 구조에 맞춰서 응답
    Map<String, Object> responseData = Map.of(
        "message", "로그인 성공",
        "userId", user.getUserId(),
        "loginId", user.getLoginId(),
        "name", user.getName(),
        "email", user.getEmail(),
        "role", user.getRole(),
        "status", user.getStatus());

    objectMapper.writeValue(response.getWriter(), responseData);
  }
}
