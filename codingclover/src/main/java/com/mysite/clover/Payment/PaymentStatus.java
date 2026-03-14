package com.mysite.clover.Payment;

public enum PaymentStatus {
    PAID,              // 결제 완료
    REFUND_REQUEST,    // 환불 요청
    REFUNDED,          // 환불 완료
    REJECTED           // 환불 거절
}
