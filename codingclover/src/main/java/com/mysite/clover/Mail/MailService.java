package com.mysite.clover.Mail;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

  // 실제 메일 발송 로직을 위한 JavaMailSender 등이 필요하지만,
  // 지금은 컨트롤러 구조 개선에 집중하기 위해 껍데기만 구현합니다.
  // private final JavaMailSender javaMailSender;

  public int sendMail(String mail) {
    // 랜덤 인증번호 생성 로직 (예시)
    int number = (int) (Math.random() * (90000)) + 100000; // 100000 ~ 199999

    log.info("이메일 전송 요청: {}", mail);
    log.info("생성된 인증번호: {}", number);

    // TODO: 실제 이메일 발송 로직 구현 필요
    // MimeMessage message = javaMailSender.createMimeMessage();
    // ...
    // javaMailSender.send(message);

    return number;
  }
}
