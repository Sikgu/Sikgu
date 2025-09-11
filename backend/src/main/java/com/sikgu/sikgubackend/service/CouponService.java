package com.sikgu.sikgubackend.service;

import org.springframework.stereotype.Service;

@Service
public class CouponService {
    public boolean applyCoupon(Long userId, String couponCode) {
        // 실제로는 쿠폰 코드 유효성을 검증하고, 사용자에게 적용합니다.
        System.out.println("사용자 " + userId + "에게 쿠폰 " + couponCode + " 적용 시도");
        if ("DISCOUNT10".equals(couponCode)) {
            return true;
        }
        return false;
    }
}