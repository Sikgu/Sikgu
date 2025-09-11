package com.sikgu.sikgubackend.service;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    public String getSubscriptionNotification(Long userId) {
        // 실제로는 사용자 ID를 기반으로 구독 상태나 갱신 알림을 생성합니다.
        // 현재는 예시 메시지를 반환합니다.
        return "구독 갱신 예정일이 다가왔습니다. 확인해주세요.";
    }
}