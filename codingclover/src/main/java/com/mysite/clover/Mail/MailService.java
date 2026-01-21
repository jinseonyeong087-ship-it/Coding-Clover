package com.mysite.clover.Mail;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

  private final JavaMailSender javaMailSender;
  private static final String SENDER_EMAIL = "wnstj99999@gmail.com"; // application.properties의 username과 동일해야 함

  public int sendMail(String mail) {
    // 랜덤 인증번호 생성
    int number = (int) (Math.random() * (90000)) + 100000; // 100000 ~ 199999

    MimeMessage message = javaMailSender.createMimeMessage();

    try {
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(SENDER_EMAIL);
      helper.setTo(mail);
      helper.setSubject("Coding Clover 이메일 인증");

      String body = "";
      body += "<h3>" + "요청하신 인증 번호입니다." + "</h3>";
      body += "<h1>" + number + "</h1>";
      body += "<h3>" + "감사합니다." + "</h3>";

      helper.setText(body, true);

      javaMailSender.send(message);

      log.info("이메일 전송 성공: {} -> 번호: {}", mail, number);

    } catch (MessagingException e) {
      log.error("이메일 전송 실패", e);
      throw new RuntimeException("이메일 전송 중 오류가 발생했습니다.", e);
    }

    return number;
  }
}
