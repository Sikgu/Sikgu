package com.sikgu.sikgubackend.entity;

import com.sikgu.sikgubackend.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "subscription")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Subscription extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Long planId;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private String paymentStatus; // SUCCESS, FAILED
    private Long paidAmount;

    @Builder
    public Subscription(User user, Long planId, Long paidAmount) {
        if (user == null || planId == null || paidAmount == null) {
            throw new IllegalArgumentException("구독 생성에 필요한 필수 정보가 누락되었습니다.");
        }

        this.user = user;
        this.planId = planId;
        this.paidAmount = paidAmount;
        this.startDate = LocalDateTime.now();
        this.endDate = LocalDateTime.now().plusMonths(1);
        this.paymentStatus = "SUCCESS";
    }

    public void markAsFailed() {
        this.paymentStatus = "FAILED";
    }

    public void cancelSubscription() {
        this.endDate = LocalDateTime.now();
        this.paymentStatus = "CANCELED";
    }

    public void scheduleCancellation() {
        this.paymentStatus = "CANCELED_AT_PERIOD_END";
    }

    public void setUser(User user) {
        this.user = user;
    }
}