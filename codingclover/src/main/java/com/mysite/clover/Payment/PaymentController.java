package com.mysite.clover.Payment;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;
import com.mysite.clover.UserWallet.WalletIntegrationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;
    private final UsersRepository usersRepository;
    private final WalletIntegrationService walletIntegrationService;

    /**
     * 토스페이먼츠 결제 확인 (결제 승인)
     */
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody Map<String, Object> request, Principal principal) {
        try {
            Long userId = getUserIdFromPrincipal(principal);
            String orderId = (String) request.get("orderId");
            String paymentKey = (String) request.get("paymentKey");
            
            // amount 타입 안전 변환
            Integer amount;
            Object amountObj = request.get("amount");
            if (amountObj instanceof Integer) {
                amount = (Integer) amountObj;
            } else if (amountObj instanceof String) {
                amount = Integer.parseInt((String) amountObj);
            } else {
                amount = Integer.parseInt(amountObj.toString());
            }

            // 토스페이먼츠에 결제 승인 요청 및 DB 저장
            Payment payment = paymentService.confirmPayment(orderId, paymentKey, amount, userId);

            return ResponseEntity.ok().body(Map.of(
                "message", "결제가 성공적으로 확인되었습니다.",
                "paymentId", payment.getPaymentId(),
                "amount", payment.getAmount(),
                "orderId", payment.getOrderId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 포인트 충전 - 토스페이먼츠 결제 성공 후 호출
     */
    @PostMapping("/success")
    public ResponseEntity<?> chargePointsSuccess(@RequestBody PaymentSuccessDto payload, Principal principal) {
        try {
            Long userId = getUserIdFromPrincipal(principal);
            
            Payment payment = paymentService.chargePoints(
                payload.getPaymentKey(),
                payload.getOrderId(),
                payload.getAmount(),
                userId,
                payload.getPaymentMethod()
            );

            return ResponseEntity.ok().body(Map.of(
                "message", "포인트 충전 성공",
                "paymentId", payment.getPaymentId(),
                "amount", payment.getAmount(),
                "currentPoints", walletIntegrationService.getCurrentBalance(userId)
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "message", "포인트 충전 실패: " + e.getMessage()
            ));
        }
    }

    /**
     * 포인트 사용
     */
    @PostMapping("/use")
    public ResponseEntity<?> usePoints(@RequestBody Map<String, Object> request, Principal principal) {
        try {
            Long userId = getUserIdFromPrincipal(principal);
            Integer amount = (Integer) request.get("amount");
            String purpose = (String) request.get("purpose");

            Payment payment = paymentService.usePoints(userId, amount, purpose);

            return ResponseEntity.ok().body(Map.of(
                "message", "포인트 사용 성공",
                "paymentId", payment.getPaymentId(),
                "amount", payment.getAmount(),
                "currentPoints", walletIntegrationService.getCurrentBalance(userId)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "포인트 사용 실패: " + e.getMessage()
            ));
        }
    }

    /**
     * 현재 포인트 조회
     */
    @GetMapping("/points")
    public ResponseEntity<?> getCurrentPoints(Principal principal) {
        try {
            Long userId = getUserIdFromPrincipal(principal);
            // TODO: UserWallet 시스템으로 변경 필요
            Integer points = 0; // paymentService.getUserPoints(userId);

            return ResponseEntity.ok().body(Map.of(
                "points", points
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "포인트 조회 실패: " + e.getMessage()
            ));
        }
    }

    /**
     * 결제 내역 조회
     */
    @GetMapping("/history")
    public ResponseEntity<?> getPaymentHistory(Principal principal) {
        try {
            Long userId = getUserIdFromPrincipal(principal);
            List<Payment> history = paymentService.getUserPaymentHistory(userId);

            return ResponseEntity.ok().body(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "결제 내역 조회 실패: " + e.getMessage()
            ));
        }
    }

    /**
     * 환불 요청
     */
    @PostMapping("/refund/{paymentId}")
    public ResponseEntity<?> requestRefund(@PathVariable Long paymentId, @RequestBody Map<String, String> request, Principal principal) {
        try {
            getUserIdFromPrincipal(principal); // 권한 확인용
            String reason = request.get("reason");

            Payment refundPayment = paymentService.requestRefund(paymentId, reason);

            return ResponseEntity.ok().body(Map.of(
                "message", "환불 요청이 접수되었습니다",
                "refundPaymentId", refundPayment.getPaymentId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "환불 요청 실패: " + e.getMessage()
            ));
        }
    }

    /**
     * 전체 포인트 환불 요청
     */
    @PostMapping("/refund/full")
    public ResponseEntity<?> requestFullRefund(@RequestBody Map<String, Object> request, Principal principal) {
        try {
            Long userId = getUserIdFromPrincipal(principal);
            String reason = (String) request.get("reason");
            
            // 현재 보유 포인트 조회
            Integer currentBalance = walletIntegrationService.getCurrentBalance(userId);
            
            if (currentBalance <= 0) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "환불할 포인트가 없습니다."
                ));
            }
            
            // 전체 환불 요청 생성 (가상의 충전 건으로 처리)
            Payment fullRefundRequest = paymentService.requestFullRefund(userId, currentBalance, reason);

            return ResponseEntity.ok().body(Map.of(
                "message", "전체 환불 요청이 접수되었습니다",
                "refundPaymentId", fullRefundRequest.getPaymentId(),
                "amount", currentBalance
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "전체 환불 요청 실패: " + e.getMessage()
            ));
        }
    }

    /**
     * 환불 승인 (관리자용)
     */
    @PostMapping("/admin/refund/approve/{refundPaymentId}")
    public ResponseEntity<?> approveRefund(@PathVariable Long refundPaymentId) {
        try {
            // TODO: 관리자 권한 체크 로직 추가
            
            Payment approvedRefund = paymentService.approveRefund(refundPaymentId);

            return ResponseEntity.ok().body(Map.of(
                "message", "환불이 승인되었습니다",
                "refundPaymentId", approvedRefund.getPaymentId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "환불 승인 실패: " + e.getMessage()
            ));
        }
    }

    /**
     * 환불 거절 (관리자용)
     */
    @PostMapping("/admin/refund/reject/{refundPaymentId}")
    public ResponseEntity<?> rejectRefund(@PathVariable Long refundPaymentId) {
        try {
            // TODO: 관리자 권한 체크 로직 추가
            
            Payment rejectedRefund = paymentService.rejectRefund(refundPaymentId);

            return ResponseEntity.ok().body(Map.of(
                "message", "환불이 거절되었습니다",
                "refundPaymentId", rejectedRefund.getPaymentId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "환불 거절 실패: " + e.getMessage()
            ));
        }
    }

    /**
     * 환불 요청 목록 조회 (관리자용)
     */
    @GetMapping("/admin/refund/requests")
    public ResponseEntity<?> getRefundRequests() {
        try {
            // TODO: 관리자 권한 체크 로직 추가
            
            List<Payment> refundRequests = paymentService.getRefundRequests();

            return ResponseEntity.ok().body(refundRequests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "환불 요청 목록 조회 실패: " + e.getMessage()
            ));
        }
    }

    /**
     * 전체 결제 내역 조회 (관리자용) - 페이징 지원
     */
    @GetMapping("/admin/payments")
    public ResponseEntity<?> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            // TODO: 관리자 권한 체크 로직 추가
            
            List<PaymentWithUserDto> allPayments = paymentService.getAllPayments(page, size);

            return ResponseEntity.ok().body(allPayments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "전체 결제 내역 조회 실패: " + e.getMessage()
            ));
        }
    }

    /**
     * Principal에서 사용자 ID 추출
     */
    private Long getUserIdFromPrincipal(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("로그인이 필요합니다");
        }

        String principalName = principal.getName();
        Users user = usersRepository.findByLoginId(principalName).orElse(null);

        // 소셜 로그인 사용자 검색
        if (user == null) {
            if (usersRepository.findByLoginId("kakao_" + principalName).isPresent()) {
                user = usersRepository.findByLoginId("kakao_" + principalName).get();
            } else if (usersRepository.findByLoginId("google_" + principalName).isPresent()) {
                user = usersRepository.findByLoginId("google_" + principalName).get();
            } else if (usersRepository.findByLoginId("naver_" + principalName).isPresent()) {
                user = usersRepository.findByLoginId("naver_" + principalName).get();
            }
        }

        if (user == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다: " + principalName);
        }

        return user.getUserId();
    }
}
