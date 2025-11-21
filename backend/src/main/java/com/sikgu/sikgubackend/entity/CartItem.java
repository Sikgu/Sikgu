package com.sikgu.sikgubackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "cart_item")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plant_id", nullable = false)
    private Plant plant;

    private int quantity;

    @Builder
    public CartItem(Cart cart, Plant plant, int quantity) {
        this.cart = cart;
        this.plant = plant;
        this.quantity = (quantity <= 0) ? 1 : quantity;
    }

    void assignCart(Cart cart) {
        this.cart = cart;
    }

    void assignPlant(Plant plant) {
        this.plant = plant;
    }

    public void increaseQuantity() {
        this.quantity += 1;
    }

    public void decreaseQuantity() {
        this.quantity -= 1;
    }
}