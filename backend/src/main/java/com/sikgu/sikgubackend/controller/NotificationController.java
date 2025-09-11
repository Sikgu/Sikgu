package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
@Tag(name = "알림", description = "구독 관련 알림 API")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Operation(summary = "구독 알림", description = "구독 상태 및 갱신 알림을 전송합니다.")
    @GetMapping("/subscription/{userId}")
    public ResponseEntity<String> getSubscriptionNotification(@PathVariable Long userId) {
        String notification = notificationService.getSubscriptionNotification(userId);
        return ResponseEntity.ok(notification);
    }
}