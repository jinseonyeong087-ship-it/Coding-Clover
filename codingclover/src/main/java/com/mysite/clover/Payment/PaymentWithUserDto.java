package com.mysite.clover.Payment;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentWithUserDto {
    private Long paymentId;
    private Long userId;
    private String studentName;
    private String studentLoginId;
    private PaymentType type;
    private Integer amount;
    private String paymentMethod;
    private PaymentStatus status;
    private Long relatedPaymentId;
    private LocalDateTime paidAt;
    private String orderId;
    private String paymentKey;
    private String courseTitle; // 수강 관련 결제의 경우
    
    public PaymentWithUserDto(Payment payment, String studentName, String studentLoginId) {
        this.paymentId = payment.getPaymentId();
        this.userId = payment.getUserId();
        this.studentName = studentName;
        this.studentLoginId = studentLoginId;
        this.type = payment.getType();
        this.amount = payment.getAmount();
        this.paymentMethod = payment.getPaymentMethod();
        this.status = payment.getStatus();
        this.relatedPaymentId = payment.getRelatedPaymentId();
        this.paidAt = payment.getPaidAt();
        this.orderId = payment.getOrderId();
        this.paymentKey = payment.getPaymentKey();
        this.courseTitle = ""; // TODO: 수강 정보 연동 시 구현
    }
}