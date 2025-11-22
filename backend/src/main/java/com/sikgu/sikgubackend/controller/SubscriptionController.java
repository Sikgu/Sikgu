package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.dto.request.SubscriptionPaymentRequest;
import com.sikgu.sikgubackend.dto.response.SubscriptionResponse;
import com.sikgu.sikgubackend.entity.Subscription;
import com.sikgu.sikgubackend.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @Operation(summary = "구독 생성 및 결제 처리")
    @PostMapping
    public ResponseEntity<SubscriptionResponse> createSubscription(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SubscriptionPaymentRequest request) {

        String email = userDetails.getUsername();
        log.info("API CALL: POST /subscriptions - Creation request for user: {} with plan: {}", email, request.getPlanId());

        Subscription subscription = subscriptionService.createSubscription(email, request);

        SubscriptionResponse response = new SubscriptionResponse(subscription);

        log.info("SUBSCRIPTION SUCCESS: Created subscription ID {} for user {}", subscription.getId(), email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "활성 구독 해지 예약")
    @PostMapping("/cancellation")
    public ResponseEntity<SubscriptionResponse> scheduleCancellation(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        log.warn("API CALL: POST /subscriptions/cancellation - Cancellation scheduled request by user: {}", email);

        Subscription updatedSubscription = subscriptionService.scheduleCancellation(email);

        SubscriptionResponse response = new SubscriptionResponse(updatedSubscription);

        log.info("CANCELLATION SUCCESS: Scheduled termination for subscription ID {} by user {}", updatedSubscription.getId(), email);
        return ResponseEntity.ok(response);
    }
}