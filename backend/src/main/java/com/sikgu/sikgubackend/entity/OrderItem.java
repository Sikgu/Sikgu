package com.sikgu.sikgubackend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "order_item")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plant_id", nullable = false)
    private Plant plant;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private Long priceAtPurchase; // 구매 시점의 개당 코인 가격

    @Builder
    public OrderItem(Plant plant, int quantity, Long priceAtPurchase) {
        this.plant = plant;
        this.quantity = quantity;
        this.priceAtPurchase = priceAtPurchase;
    }

    void assignOrder(Order order) {
        this.order = order;
    }
}