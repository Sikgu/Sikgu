package com.sikgu.sikgubackend.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SubscriptionPaymentRequest {

    // 구독할 Plan ID
    private Long planId;

    // 카드 정보
    private String cardNumber; // 1234 5678 9012 3456
    private String expiryDate; // MM/YY
    private String cvc;        // 123
    private String cardHolderName; // 홍길동
}