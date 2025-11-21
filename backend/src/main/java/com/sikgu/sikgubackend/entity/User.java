package com.sikgu.sikgubackend.entity;

import com.sikgu.sikgubackend.entity.base.BaseEntity;
import com.sikgu.sikgubackend.entity.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Setter
    private String password;

    private String address;

    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private Subscription subscription;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SupportQnA> supportQnAs = new ArrayList<>();

    // 코인 관련 필드 추가 (기존 코드에 없었으므로 추가 필요)
    private Integer coins;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cart> carts = new ArrayList<>();


    @Builder
    public User(String email, String password, Role role) {
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public void updateInfo(String newAddress, String newPhoneNumber) {
        // 유효성 검사 로직 추가 가능

        this.address = newAddress;
        this.phoneNumber = newPhoneNumber;
    }

    public void addReview(Review review) {
        this.reviews.add(review);
        review.setUser(this);
    }
    public void addSupportQnA(SupportQnA supportQnA) {
        this.supportQnAs.add(supportQnA);
        supportQnA.setUser(this);
    }

    public void addToCart(Cart cart) {
        this.carts.add(cart);
    }

    public void addCoins(int amount) {
        if (this.coins == null) {
            this.coins = 0;
        }
        this.coins += amount;
    }
}