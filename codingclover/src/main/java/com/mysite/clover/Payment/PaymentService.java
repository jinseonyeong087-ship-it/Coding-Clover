package com.mysite.clover.Payment;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.mysite.clover.Product.Product;
import com.mysite.clover.Product.ProductRepository;
import com.mysite.clover.Users.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private final PaymentRepository paymentRepository;
  private final UsersRepository usersRepository;
  private final ProductRepository productRepository;

  @Value("${toss.payments.secret-key}")
  private String tossSecretKey;

  @Value("${toss.payments.confirm-url}")
  private String tossConfirmUrl;

  @Transactional
  public Payment confirmPayment(String paymentKey, String orderId, Integer amount, Long productId, Long userId,
      String paymentMethod) {

    // 1. 토스페이먼츠 API 호출해서 결제 승인 요청
    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    String secretKey = tossSecretKey + ":";
    String encodedAuth = "Basic " + Base64.getEncoder().encodeToString(secretKey.getBytes(StandardCharsets.UTF_8));

    headers.set("Authorization", encodedAuth);
    headers.setContentType(MediaType.APPLICATION_JSON);

    Map<String, Object> body = Map.of(
        "paymentKey", paymentKey,
        "orderId", orderId,
        "amount", amount);

    HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

    // 실제 API 호출 (예외처리 필요)
    try {
      ResponseEntity<String> response = restTemplate.postForEntity(
          tossConfirmUrl,
          request,
          String.class);

      // 응답 파싱 (여기서는 간단히 성공으로 가정하고 진행)
      ObjectMapper objectMapper = new ObjectMapper();
      JsonNode root = objectMapper.readTree(response.getBody());
      // String method = root.path("method").asText(); // 실제 응답에서 수단 가져오기 가능

    } catch (Exception e) {
      // 결제 승인 실패 시 예외 발생
      throw new RuntimeException("Payment confirmation failed: " + e.getMessage());
    }

    // 2. DB 저장
    Payment payment = new Payment();

    // 유저 확인 (테스트용 임시 로직)
    // 유저 확인
    if (!usersRepository.existsById(userId)) {
      throw new RuntimeException("User not found: " + userId);
    }

    // 상품 ID 확인 (이니셜라이저가 생성한 상품이 아니라면, 요청받은 ID가 없을 수 있음)
    // 하지만 프론트에서 정확한 ID를 모를 수 있으므로, 1원짜리 테스트 상품을 찾아서 매핑해줄 수도 있음.
    // 여기서는 요청받은 productId가 유효하지 않으면 "테스트 수강권"을 찾아 사용하도록 함.
    if (!productRepository.existsById(productId)) {
      Product testProduct = productRepository.findByName("테스트 수강권");
      if (testProduct != null) {
        productId = testProduct.getProductId();
      }
    }

    payment.setUserId(userId);
    payment.setProductId(productId);
    payment.setAmount(amount);
    payment.setPaymentMethod(paymentMethod != null ? paymentMethod : "Unknown");
    payment.setStatus(PaymentStatus.PAID);
    payment.setOrderId(orderId);
    payment.setPaymentKey(paymentKey);

    return paymentRepository.save(payment);
  }
}
