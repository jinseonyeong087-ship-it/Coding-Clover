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
      // ObjectMapper objectMapper = new ObjectMapper();
      // JsonNode root = objectMapper.readTree(response.getBody());

    } catch (Exception e) {
      // 결제 승인 실패 시 예외 발생
      throw new RuntimeException("Payment confirmation failed: " + e.getMessage());
    }

    // 2. DB 저장
    Payment payment = new Payment();

    // 유저 존재 여부 확인
    if (!usersRepository.existsById(userId)) {
      throw new RuntimeException("User not found: " + userId);
    }

    // 상품 ID 확인
    // [개발용 로직]: 요청받은 productId가 유효하지 않으면 '테스트 수강권'으로 대체하여 결제 진행
    // 운영 환경에서는 제거해야 함
    if (!productRepository.existsById(productId)) {
      Product testProduct = productRepository.findByName("테스트 수강권");
      if (testProduct != null) {
        productId = testProduct.getProductId();
      } else {
        // 테스트 상품도 없으면 에러
        throw new RuntimeException("Product not found: " + productId);
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
