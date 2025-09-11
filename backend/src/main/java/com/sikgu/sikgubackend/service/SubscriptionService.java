package com.sikgu.sikgubackend.service;

import org.springframework.stereotype.Service;

@Service
public class SubscriptionService {

    public String getSubscriptionStatus(Long userId) {
        // 실제로는 DB에서 구독 정보를 조회합니다.
        return "구독 상태: 활성";
    }

    public boolean changePlan(Long userId, String newPlan) {
        // 실제로는 DB에서 사용자 요금제 정보를 업데이트합니다.
        System.out.println("사용자 " + userId + "의 요금제를 " + newPlan + "(으)로 변경");
        return true;
    }
}