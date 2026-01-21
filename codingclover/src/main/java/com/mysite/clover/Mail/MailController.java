package com.mysite.clover.Mail;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession; // javax가 아니라 jakarta일 가능성이 높음 (Spring Boot 3.x)
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/member") // 원본 코드 요청 경로 유지
@RequiredArgsConstructor
@Slf4j
public class MailController {

  private final MailService mailService;

  // 인증 이메일 전송
  @PostMapping("/mailSend")
  public ResponseEntity<Map<String, Object>> mailSend(@RequestParam("mail") String mail, HttpSession session) {
    Map<String, Object> map = new HashMap<>();

    try {
      // 이메일 전송 후 인증번호 받기
      int number = mailService.sendMail(mail);

      // 핵심 수정: 인증번호를 전역 변수가 아닌 '세션'에 저장
      // 세션 유지 시간 설정 (예: 3분 = 180초) - 필요 시 설정
      // session.setMaxInactiveInterval(180);
      session.setAttribute("emailAuthNumber", number);

      map.put("success", Boolean.TRUE);
      map.put("message", "인증메일이 발송되었습니다.");
      return ResponseEntity.ok(map);

    } catch (Exception e) {
      log.error("메일 발송 실패", e);
      map.put("success", Boolean.FALSE);
      map.put("error", e.getMessage());
      return ResponseEntity.badRequest().body(map);
    }
  }

  // 인증번호 일치여부 확인
  @GetMapping("/mailCheck")
  public ResponseEntity<Boolean> mailCheck(@RequestParam("userNumber") String userNumber, HttpSession session) {

    // 세션에서 저장된 인증번호 가져오기
    Object sessionNumberObj = session.getAttribute("emailAuthNumber");

    if (sessionNumberObj == null) {
      // 세션에 인증번호가 없으면 (만료됐거나 요청한 적 없음)
      log.warn("인증번호가 세션에 존재하지 않습니다.");
      return ResponseEntity.ok(Boolean.FALSE);
    }

    String sessionNumber = String.valueOf(sessionNumberObj);
    boolean isMatch = userNumber.equals(sessionNumber);

    if (isMatch) {
      // 인증 성공 시 세션에서 번호 삭제 (재사용 방지)
      session.removeAttribute("emailAuthNumber");
    }

    return ResponseEntity.ok(isMatch);
  }
}
