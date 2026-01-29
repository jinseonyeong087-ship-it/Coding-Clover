package com.mysite.clover.Payment;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Users 관련 임포트 최소화 (Principal 사용)

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

  private final PaymentService paymentService;
  private final com.mysite.clover.Users.UsersRepository usersRepository;

  @PostMapping("/success")
  public ResponseEntity<?> paymentSuccess(@RequestBody PaymentSuccessDto payload, Principal principal) {
    try {
      String paymentKey = payload.getPaymentKey();
      String orderId = payload.getOrderId();
      Integer amount = payload.getAmount();
      Long productId = payload.getProductId();
      String paymentMethod = payload.getPaymentMethod();

      Long userId;
      if (principal != null) {
        String principalName = principal.getName();

        // 1. 정확한 loginId로 검색
        com.mysite.clover.Users.Users user = usersRepository.findByLoginId(principalName).orElse(null);

        // 2. 없으면 소셜 로그인 접두사 붙여서 검색 (Kakao, Google, Naver 등)
        if (user == null) {
          if (usersRepository.findByLoginId("kakao_" + principalName).isPresent()) {
            user = usersRepository.findByLoginId("kakao_" + principalName).get();
          } else if (usersRepository.findByLoginId("google_" + principalName).isPresent()) {
            user = usersRepository.findByLoginId("google_" + principalName).get();
          } else if (usersRepository.findByLoginId("naver_" + principalName).isPresent()) {
            user = usersRepository.findByLoginId("naver_" + principalName).get();
          }
        }

        if (user != null) {
          userId = user.getUserId();
        } else {
          // 유저를 찾지 못한 경우 예외 발생
          throw new RuntimeException("User not found with name: " + principalName);
        }
      } else {
        return ResponseEntity.status(401).body("로그인이 필요합니다.");
      }

      paymentService.confirmPayment(paymentKey, orderId, amount, productId, userId, paymentMethod);

      return ResponseEntity.ok().body("Payment successful");
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.badRequest().body("Payment failed: " + e.getMessage());
    }
  }
}
