package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.dto.SubscriptionDto;
import org.springframework.stereotype.Service;

@Service
public class SubscriptionService {

    public boolean changePlan(Long userId, String newPlan) {
        System.out.println("사용자 " + userId + "의 요금제를 " + newPlan + "(으)로 변경");
        return true;
    }

    public SubscriptionDto getSubscriptionStatus(Long userId) {
        System.out.println("사용자 " + userId + "의 구독 상태 조회");
        if (userId == 1L) {
            return new SubscriptionDto("활성", "기본 요금제");
        }
        return new SubscriptionDto("해지", "없음");
    }
}