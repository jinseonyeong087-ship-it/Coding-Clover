package com.mysite.clover.Payment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByOrderId(String orderId);
    
    // 사용자별 결제 내역 조회 (최신순)
    List<Payment> findByUserIdOrderByPaidAtDesc(Long userId);
    
    // 사용자별 특정 상태의 결제 내역
    List<Payment> findByUserIdAndStatus(Long userId, PaymentStatus status);
    
    // 사용자별 특정 타입의 결제 내역
    List<Payment> findByUserIdAndType(Long userId, PaymentType type);
    
    // 환불 요청 목록 조회 (관리자용)
    List<Payment> findByTypeAndStatus(PaymentType type, PaymentStatus status);
    
    // 특정 결제와 관련된 환불 내역
    List<Payment> findByRelatedPaymentId(Long relatedPaymentId);
}
