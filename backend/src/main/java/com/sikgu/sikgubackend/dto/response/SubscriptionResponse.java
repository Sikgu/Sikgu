package com.sikgu.sikgubackend.dto.response;

import com.sikgu.sikgubackend.entity.Subscription;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class SubscriptionResponse {

    private Long id;
    private Long planId;
    private Long paidAmount;
    private String paymentStatus;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private String userEmail;

    public SubscriptionResponse(Subscription subscription) {
        this.id = subscription.getId();
        this.planId = subscription.getPlanId();
        this.paidAmount = subscription.getPaidAmount();
        this.paymentStatus = subscription.getPaymentStatus();
        this.startDate = subscription.getStartDate();
        this.endDate = subscription.getEndDate();

        // N+1 문제 방지
        this.userEmail = subscription.getUser().getEmail();
    }
}