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

import com.mysite.clover.Users.UsersRepository;
import com.mysite.clover.UserWallet.WalletIntegrationService;

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
    private final WalletIntegrationService walletIntegrationService;
    private final com.mysite.clover.Enrollment.EnrollmentRepository enrollmentRepository;

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
        // purpose가 있으면 orderId에 포함 (예: COURSE_15)
        String orderPrefix = (purpose != null && !purpose.isEmpty()) ? purpose : "USE";
        payment.setOrderId(orderPrefix + "_" + System.currentTimeMillis());

        return paymentRepository.save(payment);
    }

    /**
     * 환불 요청
     */
    @Transactional
    public Payment requestRefund(Long paymentId, String reason) {

        Payment originalPayment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        // CHARGE(충전) 또는 USE(사용/수강신청) 만 환불 가능
        if (originalPayment.getType() != PaymentType.CHARGE && originalPayment.getType() != PaymentType.USE) {
            throw new RuntimeException("Only CHARGE or USE payments can be refunded");
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
     * 보유 포인트 환불 요청
     */
    @Transactional
    public Payment requestFullRefund(Long userId, Integer requestedAmount, String reason) {

        // 현재 보유 포인트 조회
        Integer currentBalance = walletIntegrationService.getCurrentBalance(userId);

        if (currentBalance <= 0) {
            throw new RuntimeException("환불할 포인트가 없습니다. 현재 잔액: " + currentBalance);
        }

        // 요청된 금액과 보유 금액 중 작은 값으로 환불 (보유 금액을 초과할 수 없음)
        Integer refundAmount = Math.min(requestedAmount, currentBalance);

        // 보유 포인트 환불 요청 기록 생성
        Payment fullRefundRequest = new Payment();
        fullRefundRequest.setUserId(userId);
        fullRefundRequest.setType(PaymentType.REFUND);
        fullRefundRequest.setAmount(refundAmount); // 실제 보유 포인트만큼만
        fullRefundRequest.setPaymentMethod("ADMIN");
        fullRefundRequest.setStatus(PaymentStatus.REFUND_REQUEST);
        fullRefundRequest.setOrderId("BALANCE_REFUND_" + userId + "_" + System.currentTimeMillis());
        // 보유 포인트 환불의 경우 특정 원본 결제 ID가 없으므로 null로 유지

        return paymentRepository.save(fullRefundRequest);
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

        // 원본 결제 정보 확인
        Payment originalPayment = null;
        if (refundPayment.getRelatedPaymentId() != null) {
            originalPayment = paymentRepository.findById(refundPayment.getRelatedPaymentId()).orElse(null);
        }

        if (originalPayment != null && originalPayment.getType() == PaymentType.USE) {
            // [수강 취소 환불 시나리오]
            // 1. 포인트 돌려주기 (Refund Points -> Balance Increase)
            walletIntegrationService.refundPoints(
                    refundPayment.getUserId(),
                    refundPayment.getAmount(),
                    refundPayment.getPaymentId());

            // 2. 수강 취소 (Enrollment Cancel)
            String orderId = originalPayment.getOrderId(); // 예: COURSE_15_123456
            if (orderId != null && orderId.startsWith("COURSE_")) {
                try {
                    String[] parts = orderId.split("_");
                    if (parts.length >= 2) {
                        Long courseId = Long.parseLong(parts[1]);

                        // EnrollmentService나 Repository를 통해 취소 처리
                        // 여기서는 Repository 직접 사용 (Enrollment 취소 상태 변경)
                        com.mysite.clover.Users.Users user = usersRepository.findById(refundPayment.getUserId())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                        com.mysite.clover.Enrollment.Enrollment enrollment = enrollmentRepository
                                .findByUserAndCourse_CourseId(user, courseId)
                                .orElseThrow(
                                        () -> new RuntimeException("Enrollment not found for course: " + courseId));

                        enrollment.setStatus(com.mysite.clover.Enrollment.EnrollmentStatus.CANCELLED);
                        enrollment.setCancelledAt(java.time.LocalDateTime.now());
                        enrollmentRepository.save(enrollment);
                    }
                } catch (Exception e) {
                    System.err.println("Failed to cancel enrollment: " + e.getMessage());
                    // 수강 취소 실패하더라도 환불은 진행? 아니면 롤백? -> 일단 진행하되 로그 남김
                }
            }

        } else {
            // [포인트 충전 취소 / 보유 포인트 환불 시나리오]
            // 사용자 보유 포인트에서 차감 (Use Points -> Balance Decrease)

            Integer currentBalance = walletIntegrationService.getCurrentBalance(refundPayment.getUserId());
            if (currentBalance < refundPayment.getAmount()) {
                throw new RuntimeException(
                        "보유 포인트가 부족합니다. 보유: " + currentBalance + ", 환불요청: " + refundPayment.getAmount());
            }

            try {
                walletIntegrationService.usePoints(
                        refundPayment.getUserId(),
                        refundPayment.getAmount(),
                        refundPayment.getPaymentId());
            } catch (Exception e) {
                throw new RuntimeException("포인트 차감 실패: " + e.getMessage());
            }
        }

        refundPayment.setStatus(PaymentStatus.REFUNDED);
        Payment savedRefund = paymentRepository.save(refundPayment);
        invalidateCache(); // 캐시 무효화
        return savedRefund;
    }

    /**
     * 환불 거절 (관리자용)
     */
    @Transactional
    public Payment rejectRefund(Long refundPaymentId) {

        Payment refundPayment = paymentRepository.findById(refundPaymentId)
                .orElseThrow(() -> new RuntimeException("Refund payment not found: " + refundPaymentId));

        if (refundPayment.getStatus() != PaymentStatus.REFUND_REQUEST) {
            throw new RuntimeException("Payment is not in REFUND_REQUEST status");
        }

        refundPayment.setStatus(PaymentStatus.REJECTED);
        Payment savedRefund = paymentRepository.save(refundPayment);
        invalidateCache(); // 캐시 무효화
        return savedRefund;
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
                            return payment.getAmount(); // 충전: +
                        case USE:
                            return -payment.getAmount(); // 사용: -
                        case REFUND:
                            return payment.getAmount(); // 환불: +
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
