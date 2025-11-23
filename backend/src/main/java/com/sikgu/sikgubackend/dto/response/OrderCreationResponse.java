package com.sikgu.sikgubackend.dto.response;

import com.sikgu.sikgubackend.entity.Order;
import com.sikgu.sikgubackend.entity.enums.OrderStatus;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Getter
@RequiredArgsConstructor
public class OrderCreationResponse {

    // Wrapper/Envelope 필드
    private final boolean success; // 성공 여부 (true/false)
    private final ErrorDetailsDto error; // 실패 시 에러 정보 (성공 시 null)

    // 성공 응답 필드 (실패 시 null)
    private final Long orderId;
    private final Long totalAmount;
    private final OrderStatus status;
    private final LocalDateTime orderDate;
    private final String message;

    // 성공 시 생성자
    public OrderCreationResponse(Order order) {
        this.success = true; // 성공
        this.error = null;
        this.orderId = order.getId();
        this.totalAmount = order.getTotalAmount();
        this.status = order.getStatus();
        this.orderDate = order.getOrderDate();
        this.message = "코인 결제 및 주문 생성이 완료되었습니다.";
    }

    // 실패 시 생성자 (로컬 try-catch에서 사용)
    public OrderCreationResponse(String errorMessage) {
        this.success = false; // 실패
        this.error = new ErrorDetailsDto(errorMessage);
        this.orderId = null;
        this.totalAmount = null;
        this.status = null;
        this.orderDate = null;
        this.message = "트랜잭션이 실패했습니다.";
    }
}