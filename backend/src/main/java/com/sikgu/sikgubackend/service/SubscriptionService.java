package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.dto.request.SubscriptionPaymentRequest;
import com.sikgu.sikgubackend.dto.response.PlanDto;
import com.sikgu.sikgubackend.entity.Subscription;
import com.sikgu.sikgubackend.entity.User;
import com.sikgu.sikgubackend.repository.SubscriptionRepository;
import com.sikgu.sikgubackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final PlanService planService;

    // 더미 결제를 위한 성공 가능 카드 목록 (실제 서비스에서는 DB/PG사 연동 필요)
    private static final List<String> SUCCESS_CARDS = List.of(
            "1234567812345678",
            "0000000000000000"
    );

    // 더미 결제용 임시 plan 가격
    private Long getPlanPrice(Long planId) {
        if (planId == 1L) return 4900L;
        if (planId == 2L) return 9900L;
        log.warn("PAYMENT ERROR: Requested plan ID {} does not exist.", planId);
        throw new IllegalArgumentException("존재하지 않는 구독 플랜 ID입니다.");
    }

    @Transactional
    public Subscription createSubscription(String email, SubscriptionPaymentRequest request) {
        log.info("SUBSCRIPTION FLOW: Starting new subscription process for user: {} with plan: {}", email, request.getPlanId());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("SUBSCRIPTION FAILED: User not found with email: {}", email);
                    return new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email);
                });

        PlanDto plan = planService.findById(request.getPlanId());

        Long planPrice = plan.getPrice();

        if (!isPaymentSuccessful(request)) {
            log.warn("PAYMENT FAILED: Dummy payment simulation failed for user {}.", email);
            throw new IllegalArgumentException("결제 정보가 유효하지 않거나 결제에 실패했습니다.");
        }

        Subscription newSubscription = Subscription.builder()
                .user(user)
                .planId(request.getPlanId())
                .paidAmount(planPrice)
                .build();

        subscriptionRepository.save(newSubscription);
        log.info("SUBSCRIPTION SUCCESS: New subscription ID {} created for user {}.", newSubscription.getId(), email);

        user.addCoins(plan.getCoins());
        userRepository.save(user);
        log.info("COIN GAIN SUCCESS: User {} gained {} coins for subscription.", email, plan.getCoins());

        return newSubscription;
    }

    private boolean isPaymentSuccessful(SubscriptionPaymentRequest request) {
        String cleanedCardNumber = request.getCardNumber().replaceAll("[^0-9]", "");
        log.debug("PAYMENT CHECK: Validating payment for card starting with {}.", cleanedCardNumber.substring(0, 4));

        if (!"123".equals(request.getCvc())) {
            log.warn("PAYMENT CHECK FAILED: Invalid CVC provided.");
            return false;
        }

        return SUCCESS_CARDS.contains(cleanedCardNumber);
    }

    @Transactional
    public Subscription scheduleCancellation(String email) {
        log.info("CANCELLATION FLOW: Starting schedule cancellation for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("CANCELLATION FAILED: User not found with email: {}", email);
                    return new UsernameNotFoundException("사용자 정보를 찾을 수 없습니다: " + email);
                });

        Subscription subscription = subscriptionRepository.findByUserAndPaymentStatus(user, "SUCCESS")
                .orElseThrow(() -> {
                    log.warn("CANCELLATION FAILED: No active subscription found for user: {}", email);
                    return new IllegalStateException("해지할 활성 구독 정보가 없습니다.");
                });

        subscription.scheduleCancellation();

        subscriptionRepository.save(subscription);
        log.info("CANCELLATION SUCCESS: Scheduled termination for subscription ID {} by user {}.", subscription.getId(), email);

        return subscription;
    }
}