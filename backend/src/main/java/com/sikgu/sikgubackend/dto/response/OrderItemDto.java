package com.sikgu.sikgubackend.dto.response;

import com.sikgu.sikgubackend.entity.OrderItem;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class OrderItemDto {

    private final String plantName;
    private final int quantity;
    private final Long priceAtPurchase; // 구매 시점 개당 코인 가격

    public OrderItemDto(OrderItem orderItem) {
        this.plantName = orderItem.getPlant().getName();
        this.quantity = orderItem.getQuantity();
        this.priceAtPurchase = orderItem.getPriceAtPurchase();
    }
}