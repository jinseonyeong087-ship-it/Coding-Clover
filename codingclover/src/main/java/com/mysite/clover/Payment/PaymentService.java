package com.mysite.clover.Payment;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.List;

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

import com.mysite.clover.Users.UsersRepository;

import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UsersRepository usersRepository;

    // 간단한 메모리 캐시 (5분)
    private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private static final long CACHE_DURATION_MINUTES = 5;
    
    private static class CacheEntry {
        final List<PaymentWithUserDto> data;
        final LocalDateTime timestamp;
        
        CacheEntry(List<PaymentWithUserDto> data) {
            this.data = data;
            this.timestamp = LocalDateTime.now();
        }
        
        boolean isExpired() {
            return LocalDateTime.now().isAfter(timestamp.plusMinutes(CACHE_DURATION_MINUTES));
        }
    }

    @Value("${toss.payments.secret-key}")
    private String tossSecretKey;

    @Value("${toss.payments.confirm-url}")
    private String tossConfirmUrl;

    /**
     * 토스페이먼츠 결제 승인 및 Payment 엔티티 생성
     */
    @Transactional
    public Payment confirmPayment(String orderId, String paymentKey, Integer amount, Long userId) {
        
        // 1. 토스페이먼츠 API 호출해서 결제 승인 요청
        confirmTossPayment(paymentKey, orderId, amount);

        // 2. 유저 존재 여부 확인
        if (!usersRepository.existsById(userId)) {
            throw new RuntimeException("User not found: " + userId);
        }

        // 3. Payment 엔티티 생성 및 저장
        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setType(PaymentType.CHARGE);
        payment.setAmount(amount);
        payment.setPaymentMethod("TOSS_CARD");
        payment.setStatus(PaymentStatus.PAID);
        payment.setOrderId(orderId);
        payment.setPaymentKey(paymentKey);

        Payment savedPayment = paymentRepository.save(payment);
        invalidateCache(); // 캐시 무효화
        return savedPayment;
    }

    /**
     * 포인트 충전 (토스페이먼츠)
     */
    @Transactional
    public Payment chargePoints(String paymentKey, String orderId, Integer amount, Long userId, String paymentMethod) {
        
        // 1. 토스페이먼츠 API 호출해서 결제 승인 요청
        confirmTossPayment(paymentKey, orderId, amount);

        // 2. 유저 존재 여부 확인
        if (!usersRepository.existsById(userId)) {
            throw new RuntimeException("User not found: " + userId);
        }

        // 3. 포인트 충전 기록 생성
        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setType(PaymentType.CHARGE);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod != null ? paymentMethod : "TOSS_MOCK");
        payment.setStatus(PaymentStatus.PAID);
        payment.setOrderId(orderId);
        payment.setPaymentKey(paymentKey);

        return paymentRepository.save(payment);
    }

    /**
     * 포인트 사용 
     */
    @Transactional
    public Payment usePoints(Long userId, Integer amount, String purpose) {
        
        // 1. 사용 가능한 포인트 확인
        Integer currentPoints = getUserPoints(userId);
        if (currentPoints < amount) {
            throw new RuntimeException("Insufficient points. Current: " + currentPoints + ", Required: " + amount);
        }

        // 2. 포인트 사용 기록 생성
        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setType(PaymentType.USE);
        payment.setAmount(amount);
        payment.setPaymentMethod("POINT");
        payment.setStatus(PaymentStatus.PAID);
        payment.setOrderId("USE_" + System.currentTimeMillis());

        return paymentRepository.save(payment);
    }

    /**
     * 환불 요청
     */
    @Transactional
    public Payment requestRefund(Long paymentId, String reason) {
        
        Payment originalPayment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        if (originalPayment.getType() != PaymentType.CHARGE) {
            throw new RuntimeException("Only charge payments can be refunded");
        }

        if (originalPayment.getStatus() != PaymentStatus.PAID) {
            throw new RuntimeException("Payment is not in PAID status");
        }

        // 환불 기록 생성
        Payment refundPayment = new Payment();
        refundPayment.setUserId(originalPayment.getUserId());
        refundPayment.setType(PaymentType.REFUND);
        refundPayment.setAmount(originalPayment.getAmount());
        refundPayment.setPaymentMethod("ADMIN");
        refundPayment.setStatus(PaymentStatus.REFUND_REQUEST);
        refundPayment.setRelatedPaymentId(paymentId);
        refundPayment.setOrderId("REFUND_" + paymentId + "_" + System.currentTimeMillis());

        return paymentRepository.save(refundPayment);
    }

    /**
     * 환불 승인 (관리자용)
     */
    @Transactional
    public Payment approveRefund(Long refundPaymentId) {
        
        Payment refundPayment = paymentRepository.findById(refundPaymentId)
            .orElseThrow(() -> new RuntimeException("Refund payment not found: " + refundPaymentId));

        if (refundPayment.getStatus() != PaymentStatus.REFUND_REQUEST) {
            throw new RuntimeException("Payment is not in REFUND_REQUEST status");
        }

        refundPayment.setStatus(PaymentStatus.REFUNDED);
        return paymentRepository.save(refundPayment);
    }

    /**
     * 사용자의 현재 포인트 계산
     */
    public Integer getUserPoints(Long userId) {
        List<Payment> payments = paymentRepository.findByUserIdAndStatus(userId, PaymentStatus.PAID);
        
        return payments.stream()
            .mapToInt(payment -> {
                switch (payment.getType()) {
                    case CHARGE:
                        return payment.getAmount();  // 충전: +
                    case USE:
                        return -payment.getAmount(); // 사용: -
                    case REFUND:
                        return payment.getAmount();  // 환불: +
                    default:
                        return 0;
                }
            })
            .sum();
    }

    /**
     * 사용자의 결제 내역 조회
     */
    public List<Payment> getUserPaymentHistory(Long userId) {
        return paymentRepository.findByUserIdOrderByPaidAtDesc(userId);
    }
    /**
     * 전체 결제 내역 조회 (관리자용) - 페이징 지원 + 캐싱
     */
    public List<PaymentWithUserDto> getAllPayments(int page, int size) {
        String cacheKey = String.format("payments_%d_%d", page, size);
        
        // 캐시 확인
        CacheEntry cached = cache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return cached.data;
        }
        
        // 캐시 미스 또는 만료 - DB에서 조회
        Pageable pageable = PageRequest.of(page, size, Sort.by("paidAt").descending());
        List<Payment> payments = paymentRepository.findAll(pageable).getContent();
        
        List<PaymentWithUserDto> result = payments.stream()
            .map(payment -> {
                var user = usersRepository.findById(payment.getUserId());
                String studentName = user.isPresent() ? user.get().getName() : "Unknown";
                String studentLoginId = user.isPresent() ? user.get().getLoginId() : "Unknown";
                return new PaymentWithUserDto(payment, studentName, studentLoginId);
            })
            .toList();
        
        // 캐시에 저장
        cache.put(cacheKey, new CacheEntry(result));
        
        return result;
    }
    
    /**
     * 캐시 무효화 (새 결제가 생성될 때 호출)
     */
    private void invalidateCache() {
        cache.clear();
    }
    /**
     * 환불 요청 목록 조회 (관리자용)
     */
    public List<Payment> getRefundRequests() {
        return paymentRepository.findByTypeAndStatus(PaymentType.REFUND, PaymentStatus.REFUND_REQUEST);
    }

    /**
     * 토스페이먼츠 결제 승인 API 호출
     */
    private void confirmTossPayment(String paymentKey, String orderId, Integer amount) {
        
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

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                tossConfirmUrl,
                request,
                String.class);

            // 응답 검증 로직 필요시 추가
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Toss payment confirmation failed");
            }

        } catch (Exception e) {
            throw new RuntimeException("Payment confirmation failed: " + e.getMessage());
        }
    }
}
