package com.mysite.clover.Payment;

import lombok.Data;

@Data
public class PaymentSuccessDto {
    private String paymentKey;
    private String orderId;
    private Integer amount;
    private String paymentMethod;
}
