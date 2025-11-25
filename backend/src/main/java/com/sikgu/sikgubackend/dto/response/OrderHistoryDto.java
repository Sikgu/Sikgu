package com.sikgu.sikgubackend.dto.response;

import com.sikgu.sikgubackend.entity.Order;
import com.sikgu.sikgubackend.entity.enums.OrderStatus;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@RequiredArgsConstructor
public class OrderHistoryDto {

    private final Long orderId;
    private final LocalDateTime orderDate;
    private final OrderStatus status;
    private final Long totalAmount;
    private final List<OrderItemDto> items;

    public OrderHistoryDto(Order order) {
        this.orderId = order.getId();
        this.orderDate = order.getOrderDate();
        this.status = order.getStatus();
        this.totalAmount = order.getTotalAmount();

        this.items = order.getItems().stream()
                .map(OrderItemDto::new)
                .collect(Collectors.toList());
    }
}