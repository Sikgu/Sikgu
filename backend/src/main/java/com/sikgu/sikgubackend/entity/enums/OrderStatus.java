package com.sikgu.sikgubackend.entity.enums;

public enum OrderStatus {
    PENDING,    // 주문 접수 (대기 중)
    SHIPPED,    // 배송 시작
    COMPLETED,  // 배송 완료 (구매 확정)
    CANCELED,   // 주문 취소
}